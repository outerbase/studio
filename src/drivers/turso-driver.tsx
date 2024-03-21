import {
  escapeSqlValue,
  generateDeleteStatement,
  generateInsertStatement,
  generateSelectOneWithConditionStatement,
  generateUpdateStatement,
} from "@/lib/sql-helper";
import { parseCreateTableScript } from "@/lib/sql-parse-table";
import {
  createClient,
  Client,
  InStatement,
  ResultSet,
  Row,
} from "@libsql/client/web";
import {
  BaseDriver,
  DatabaseSchemaItem,
  DatabaseTableColumn,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  SelectFromTableOptions,
} from "./base-driver";
import { validateOperation } from "@/lib/validation";

export function transformRawResult(raw: ResultSet): ResultSet {
  const r = {
    ...raw,
    rows: raw.rows.map((r) =>
      raw.columns.reduce((a, b, idx) => {
        a[b] = r[idx];
        return a;
      }, {} as Row)
    ),
  };

  return r;
}

export default class DatabaseDriver implements BaseDriver {
  protected client: Client;
  protected endpoint: string = "";
  protected authToken = "";

  constructor(url: string, authToken: string) {
    this.endpoint = url;
    this.authToken = authToken;

    this.client = createClient({
      url: this.endpoint,
      authToken: this.authToken,
    });
  }

  protected escapeId(id: string) {
    return id.replace(/"/g, '""');
  }

  getEndpoint() {
    return this.endpoint;
  }

  async query(stmt: InStatement) {
    const stream = this.client;
    const r = await stream.execute(stmt);
    return transformRawResult(r);
  }

  async transaction(stmt: InStatement[]) {
    return (await this.client.batch(stmt, "write")).map(transformRawResult);
  }

  close() {
    this.client.close();
  }

  async schemas(): Promise<DatabaseSchemaItem[]> {
    const result = await this.query("SELECT * FROM sqlite_schema;");

    return result.rows
      .filter((row) => row.type === "table")
      .map((row) => {
        return {
          name: row.name as string,
        };
      });
  }

  protected async legacyTableSchema(
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = "SELECT * FROM pragma_table_info(?);";
    const binding = [tableName];
    const result = await this.query({ sql, args: binding });

    const columns: DatabaseTableColumn[] = result.rows.map((row) => ({
      name: row.name?.toString() ?? "",
      type: row.type?.toString() ?? "",
      pk: !!row.pk,
    }));

    // Check auto increment
    let hasAutoIncrement = false;

    try {
      const seqCount = await this.query(
        `SELECT COUNT(*) AS total FROM sqlite_sequence WHERE name=${escapeSqlValue(
          tableName
        )};`
      );

      const seqRow = seqCount.rows[0];
      if (seqRow && Number(seqRow[0] ?? 0) > 0) {
        hasAutoIncrement = true;
      }
    } catch (e) {
      console.error(e);
    }

    return {
      columns,
      pk: columns.filter((col) => col.pk).map((col) => col.name),
      autoIncrement: hasAutoIncrement,
    };
  }

  async tableSchema(tableName: string): Promise<DatabaseTableSchema> {
    const sql = `SELECT * FROM sqlite_schema WHERE tbl_name = ${escapeSqlValue(
      tableName
    )};`;
    const result = await this.query(sql);

    try {
      const def = result.rows.find((row) => row.type === "table");
      if (def) {
        const createScript = def.sql as string;
        return { ...parseCreateTableScript(createScript), createScript };
      }
    } catch (e) {
      console.error(e);
    }

    return await this.legacyTableSchema(tableName);
  }

  async selectTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: ResultSet; schema: DatabaseTableSchema }> {
    const whereRaw = options.whereRaw?.trim();

    const sql = `SELECT * FROM ${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } LIMIT ? OFFSET ?;`;

    const binding = [options.limit, options.offset];
    return {
      data: await this.query({ sql, args: binding }),
      schema: await this.tableSchema(tableName),
    };
  }

  protected validateUpdateOperation(
    ops: DatabaseTableOperation[],
    validateSchema: DatabaseTableSchema
  ) {
    for (const op of ops) {
      const { valid, reason } = validateOperation(op, validateSchema);
      if (!valid) {
        throw new Error(reason);
      }
    }
  }

  async updateTableData(
    tableName: string,
    ops: DatabaseTableOperation[],
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]> {
    if (validateSchema) {
      this.validateUpdateOperation(ops, validateSchema);
    }

    const sqls = ops.map((op) => {
      if (op.operation === "INSERT")
        return generateInsertStatement(tableName, op.values);
      if (op.operation === "DELETE")
        return generateDeleteStatement(tableName, op.where);
      if (op.operation === "UPDATE")
        return generateUpdateStatement(tableName, op.where, op.values);
      return "";
    });

    const result = await this.transaction(sqls);

    const tmp: DatabaseTableOperationReslt[] = [];

    for (let i = 0; i < result.length; i++) {
      const r = result[i];
      const op = ops[i];

      if (op.operation === "UPDATE") {
        const selectStatement = generateSelectOneWithConditionStatement(
          tableName,
          op.where
        );

        // This transform to make it friendly for sending via HTTP
        const selectResult = await this.query(selectStatement);

        tmp.push({
          lastId: r.lastInsertRowid,
          record: selectResult.rows[0],
        });
      } else {
        tmp.push({
          lastId: r.lastInsertRowid,
        });
      }
    }

    return tmp;
  }
}

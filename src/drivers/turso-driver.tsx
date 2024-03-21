import { escapeSqlValue } from "@/lib/sql-helper";
import { parseCreateTableScript } from "@/lib/sql-parse-table";
import {
  createClient,
  Client,
  InStatement,
  ResultSet,
} from "@libsql/client/web";
import {
  BaseDriver,
  DatabaseSchemaItem,
  DatabaseTableColumn,
  DatabaseTableSchema,
  SelectFromTableOptions,
} from "./base-driver";

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
      intMode: "bigint",
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

    console.info("Querying", stmt);
    const r = await stream.execute(stmt);
    console.info("Result", r);

    return r;
  }

  transaction(stmt: InStatement[]) {
    return this.client.batch(stmt, "write");
  }

  close() {
    this.client.close();
  }

  async getTableList(): Promise<DatabaseSchemaItem[]> {
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

  async getTableSchema(tableName: string): Promise<DatabaseTableSchema> {
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

  async selectFromTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<ResultSet> {
    const whereRaw = options.whereRaw?.trim();

    const sql = `SELECT * FROM ${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } LIMIT ? OFFSET ?;`;

    const binding = [options.limit, options.offset];
    return await this.query({ sql, args: binding });
  }
}

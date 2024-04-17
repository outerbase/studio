import type {
  Statement,
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseTableColumn,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  DatabaseTriggerSchema,
  SelectFromTableOptions,
} from "./base-driver";
import { BaseDriver } from "./base-driver";

import {
  escapeSqlValue,
  generateInsertStatement,
  generateDeleteStatement,
  generateUpdateStatement,
  generateSelectOneWithConditionStatement,
} from "./../sqlite/sql-helper";

import { parseCreateTableScript } from "./../sqlite/sql-parse-table";
import { parseCreateTriggerScript } from "./../sqlite/sql-parse-trigger";
import { validateOperation } from "./../lib/validation";

export abstract class SqliteLikeBaseDriver extends BaseDriver {
  protected escapeId(id: string) {
    return `"${id.replace(/"/g, '""')}"`;
  }

  abstract override query(stmt: Statement): Promise<DatabaseResultSet>;
  abstract override transaction(
    stmts: Statement[]
  ): Promise<DatabaseResultSet[]>;

  async schemas(): Promise<DatabaseSchemaItem[]> {
    const result = await this.query("SELECT * FROM sqlite_schema;");

    const tmp: DatabaseSchemaItem[] = [];
    const rows = result.rows as Array<{
      type: string;
      name: string;
      tbl_name: string;
      sql: string;
    }>;

    for (const row of rows) {
      if (row.type === "table") {
        try {
          tmp.push({
            type: "table",
            name: row.name,
            tableSchema: parseCreateTableScript(row.sql),
          });
        } catch {
          tmp.push({ type: "table", name: row.name });
        }
      } else if (row.type === "trigger") {
        tmp.push({ type: "trigger", name: row.name, tableName: row.tbl_name });
      } else if (row.type === "view") {
        tmp.push({ type: "view", name: row.name });
      }
    }

    return tmp;
  }

  async trigger(name: string): Promise<DatabaseTriggerSchema> {
    const result = await this.query(
      `SELECT * FROM sqlite_schema WHERE "type"='trigger' AND name=${escapeSqlValue(
        name
      )};`
    );

    const triggerRow = result.rows[0] as { sql: string } | undefined;
    if (!triggerRow) throw new Error("Trigger does not exist");

    return parseCreateTriggerScript(triggerRow.sql);
  }

  close(): void {
    // do nothing
  }

  protected async legacyTableSchema(
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = "SELECT * FROM pragma_table_info(?);";
    const binding = [tableName];
    const result = await this.query({ sql, args: binding });

    const rows = result.rows as Array<{
      name: string;
      type: string;
      pk: number;
    }>;

    const columns: DatabaseTableColumn[] = rows.map((row) => ({
      name: row.name,
      type: row.type,
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
      const rows = result.rows as Array<{ type: string; sql: string }>;
      const def = rows.find((row) => row.type === "table");
      if (def) {
        const createScript = def.sql;
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
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }> {
    const whereRaw = options.whereRaw?.trim();

    const orderPart =
      options.orderBy && options.orderBy.length > 0
        ? options.orderBy
            .map((r) => `${this.escapeId(r.columnName)} ${r.by}`)
            .join(", ")
        : "";

    const sql = `SELECT * FROM ${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } ${orderPart ? ` ORDER BY ${orderPart}` : ""} LIMIT ? OFFSET ?;`;

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

      return generateUpdateStatement(tableName, op.where, op.values);
    });

    const result = await this.transaction(sqls);

    const tmp: DatabaseTableOperationReslt[] = [];

    for (let i = 0; i < result.length; i++) {
      const r = result[i];
      const op = ops[i];

      if (!r || !op) {
        tmp.push({});
        continue;
      }

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
      } else if (op.operation === "INSERT") {
        if (op.autoIncrementPkColumn) {
          const selectStatement = generateSelectOneWithConditionStatement(
            tableName,
            { [op.autoIncrementPkColumn]: r.lastInsertRowid }
          );

          // This transform to make it friendly for sending via HTTP
          const selectResult = await this.query(selectStatement);

          tmp.push({
            record: selectResult.rows[0],
            lastId: r.lastInsertRowid,
          });
        }

        tmp.push({});
      }

      tmp.push({});
    }

    return tmp;
  }
}

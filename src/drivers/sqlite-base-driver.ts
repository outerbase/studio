import type {
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableColumn,
  DatabaseTableSchema,
  DatabaseTriggerSchema,
  DatabaseValue,
  DriverFlags,
  SelectFromTableOptions,
} from "./base-driver";
import { escapeSqlValue } from "@/drivers/sqlite/sql-helper";

import { parseCreateTableScript } from "@/drivers/sqlite/sql-parse-table";
import { parseCreateTriggerScript } from "@/drivers/sqlite/sql-parse-trigger";
import CommonSQLImplement from "./common-sql-imp";

export abstract class SqliteLikeBaseDriver extends CommonSQLImplement {
  protected escapeId(id: string) {
    return `"${id.replace(/"/g, '""')}"`;
  }

  getFlags(): DriverFlags {
    return {
      supportBigInt: false,
      defaultSchema: "main",
      optionalSchema: true,
    };
  }

  async schemas(): Promise<DatabaseSchemas> {
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

    return {
      main: tmp,
    };
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
    const sql = `SELECT * FROM pragma_table_info(${this.escapeId(tableName)});`;
    const result = await this.query(sql);

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

  async findFirst(
    tableName: string,
    key: Record<string, DatabaseValue>
  ): Promise<DatabaseResultSet> {
    const wherePart = Object.entries(key)
      .map(([colName, colValue]) => {
        return `${this.escapeId(colName)} = ${escapeSqlValue(colValue)}`;
      })
      .join(", ");

    const sql = `SELECT * FROM ${this.escapeId(tableName)} ${wherePart ? "WHERE " + wherePart : ""} LIMIT 1 OFFSET 0`;
    return this.query(sql);
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
    } ${orderPart ? ` ORDER BY ${orderPart}` : ""} LIMIT ${escapeSqlValue(options.limit)} OFFSET ${escapeSqlValue(options.offset)};`;

    return {
      data: await this.query(sql),
      schema: await this.tableSchema(tableName),
    };
  }
}

import type {
  ColumnTypeSelector,
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableColumn,
  DatabaseTableSchema,
  DatabaseTableSchemaChange,
  DatabaseTriggerSchema,
  DatabaseValue,
  DriverFlags,
  SelectFromTableOptions,
  TableColumnDataType,
} from "./base-driver";
import { convertSqliteType, escapeSqlValue } from "@/drivers/sqlite/sql-helper";

import { parseCreateTableScript } from "@/drivers/sqlite/sql-parse-table";
import { parseCreateTriggerScript } from "@/drivers/sqlite/sql-parse-trigger";
import CommonSQLImplement from "./common-sql-imp";
import generateSqlSchemaChange from "./sqlite/sqlite-generate-schema";

export abstract class SqliteLikeBaseDriver extends CommonSQLImplement {
  supportPragmaList = true;

  columnTypeSelector: ColumnTypeSelector = {
    type: "dropdown",
    dropdownOptions: [
      { text: "Integer", value: "INTEGER" },
      { text: "Real", value: "REAL" },
      { text: "Text", value: "TEXT" },
      { text: "Blob", value: "BLOB" },
    ],
  };

  escapeId(id: string) {
    return `"${id.replace(/"/g, '""')}"`;
  }

  escapeValue(value: unknown): string {
    return escapeSqlValue(value);
  }

  getFlags(): DriverFlags {
    return {
      supportRowId: true,
      supportBigInt: false,
      supportModifyColumn: false,
      supportInsertReturning: true,
      supportUpdateReturning: true,
      defaultSchema: "main",
      optionalSchema: true,
      mismatchDetection: false,
      supportCreateUpdateTable: true,
      dialect: "sqlite",
    };
  }

  protected getSchemaList(
    result: DatabaseResultSet,
    schemaName: string
  ): DatabaseSchemaItem[] {
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
            schemaName,
            name: row.name,
            tableSchema: parseCreateTableScript(schemaName, row.sql),
          });
        } catch {
          tmp.push({ type: "table", name: row.name, schemaName });
        }
      } else if (row.type === "trigger") {
        tmp.push({
          type: "trigger",
          name: row.name,
          tableName: row.tbl_name,
          schemaName,
        });
      } else if (row.type === "view") {
        tmp.push({ type: "view", name: row.name, schemaName });
      }
    }

    return tmp;
  }

  protected async legacyTableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = `SELECT * FROM ${this.escapeId(schemaName)}.pragma_table_info(${this.escapeId(tableName)});`;
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
        `SELECT COUNT(*) AS total FROM ${this.escapeId(schemaName)}.sqlite_sequence WHERE name=${escapeSqlValue(
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
      schemaName,
      pk: columns.filter((col) => col.pk).map((col) => col.name),
      autoIncrement: hasAutoIncrement,
    };
  }

  async schemas(): Promise<DatabaseSchemas> {
    let databaseList = [{ name: "main" }];

    try {
      if (this.supportPragmaList) {
        databaseList = (await this.query("PRAGMA database_list;")).rows as {
          name: string;
        }[];
      }
    } catch {
      console.error("PRAGMA database_list statement is not supported");
    }

    const tableListPerDatabase = await this.transaction(
      databaseList.map(
        (d) => `SELECT * FROM ${this.escapeId(d.name)}.sqlite_schema;`
      )
    );

    return tableListPerDatabase.reduce((a, b, idx) => {
      const schemaName = databaseList[idx].name;
      a[databaseList[idx].name] = this.getSchemaList(b, schemaName);
      return a;
    }, {} as DatabaseSchemas);
  }

  async trigger(
    schemaName: string,
    name: string
  ): Promise<DatabaseTriggerSchema> {
    const result = await this.query(
      `SELECT * FROM ${this.escapeId(schemaName)}.sqlite_schema WHERE "type"='trigger' AND name=${escapeSqlValue(
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

  inferTypeFromHeader(
    header?: DatabaseTableColumn
  ): TableColumnDataType | undefined {
    if (!header) return undefined;
    return convertSqliteType(header.type);
  }

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = `SELECT * FROM ${this.escapeId(schemaName)}.sqlite_schema WHERE tbl_name = ${escapeSqlValue(
      tableName
    )};`;
    const result = await this.query(sql);

    try {
      try {
        const rows = result.rows as Array<{ type: string; sql: string }>;
        const def = rows.find((row) => row.type === "table");

        if (def) {
          const createScript = def.sql;

          return {
            ...parseCreateTableScript(schemaName, createScript),
            createScript,
            schemaName,
            type: "table",
          };
        }

        throw new Error("Unexpected error finding table " + tableName);
      } catch (e) {
        throw new Error("Unexpected error while parsing");
      }
    } catch {
      return await this.legacyTableSchema(schemaName, tableName);
    }
  }

  createUpdateTableSchema(change: DatabaseTableSchemaChange): string[] {
    return generateSqlSchemaChange(change);
  }

  override async findFirst(
    schemaName: string,
    tableName: string,
    key: Record<string, DatabaseValue>
  ): Promise<DatabaseResultSet> {
    const wherePart = Object.entries(key)
      .map(([colName, colValue]) => {
        return `${this.escapeId(colName)} = ${escapeSqlValue(colValue)}`;
      })
      .join(", ");

    // If there is rowid, it is likely, we need to query that row back
    const hasRowId = !!key["rowid"];

    const sql = `SELECT ${hasRowId ? "rowid, " : ""}* FROM ${this.escapeId(schemaName)}.${this.escapeId(tableName)} ${wherePart ? "WHERE " + wherePart : ""} LIMIT 1 OFFSET 0`;
    return this.query(sql);
  }

  async selectTable(
    schemaName: string,
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }> {
    const schema = await this.tableSchema(schemaName, tableName);
    let injectRowIdColumn = false;

    // If there is no primary key, we will fallback to rowid.
    // But we need to make sure there is no rowid column
    if (
      schema.pk.length === 0 &&
      !schema.withoutRowId &&
      !schema.columns.find((c) => c.name === "rowid") &&
      schema.type === "table"
    ) {
      // Inject the rowid column
      injectRowIdColumn = true;
      schema.columns = [
        {
          name: "rowid",
          type: "INTEGER",
          constraint: {
            primaryKey: true,
            autoIncrement: true,
          },
        },
        ...schema.columns,
      ];
      schema.pk = ["rowid"];
      schema.autoIncrement = true;
    }

    const whereRaw = options.whereRaw?.trim();

    const orderPart =
      options.orderBy && options.orderBy.length > 0
        ? options.orderBy
            .map((r) => `${this.escapeId(r.columnName)} ${r.by}`)
            .join(", ")
        : "";

    const sql = `SELECT ${injectRowIdColumn ? "rowid, " : ""}* FROM ${this.escapeId(schemaName)}.${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } ${orderPart ? ` ORDER BY ${orderPart}` : ""} LIMIT ${escapeSqlValue(options.limit)} OFFSET ${escapeSqlValue(options.offset)};`;

    return {
      data: await this.query(sql),
      schema,
    };
  }
}

import type {
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableSchema,
  DatabaseTableSchemaChange,
  DatabaseTriggerSchema,
  DriverFlags,
} from "./base-driver";
import { escapeSqlValue } from "@/drivers/sqlite/sql-helper";

import { parseCreateTableScript } from "@/drivers/sqlite/sql-parse-table";
import { parseCreateTriggerScript } from "@/drivers/sqlite/sql-parse-trigger";
import CommonSQLImplement from "./common-sql-imp";
import generateSqlSchemaChange from "@/components/lib/sql-generate.schema";

export abstract class SqliteLikeBaseDriver extends CommonSQLImplement {
  escapeId(id: string) {
    return `"${id.replace(/"/g, '""')}"`;
  }

  escapeValue(value: unknown): string {
    return escapeSqlValue(value);
  }

  getFlags(): DriverFlags {
    return {
      supportBigInt: false,
      defaultSchema: "main",
      optionalSchema: true,
      mismatchDetection: false,
      supportCreateUpdateTable: true,
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

  async schemas(): Promise<DatabaseSchemas> {
    const databaseList = (await this.query("PRAGMA database_list;")).rows as {
      name: string;
    }[];

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

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = `SELECT * FROM ${this.escapeId(schemaName)}.sqlite_schema WHERE tbl_name = ${escapeSqlValue(
      tableName
    )};`;
    const result = await this.query(sql);

    try {
      const rows = result.rows as Array<{ type: string; sql: string }>;
      const def = rows.find((row) => row.type === "table");
      if (def) {
        const createScript = def.sql;
        return {
          ...parseCreateTableScript(schemaName, createScript),
          createScript,
          schemaName,
        };
      }

      throw new Error("Unexpected error finding table " + tableName);
    } catch (e) {
      throw new Error("Unexpected error while parsing");
    }
  }

  createUpdateTableSchema(change: DatabaseTableSchemaChange): string[] {
    return generateSqlSchemaChange(change);
  }
}

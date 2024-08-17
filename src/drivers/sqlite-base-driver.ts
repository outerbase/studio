import type {
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableSchema,
  DatabaseTriggerSchema,
  DriverFlags,
} from "./base-driver";
import { escapeSqlValue } from "@/drivers/sqlite/sql-helper";

import { parseCreateTableScript } from "@/drivers/sqlite/sql-parse-table";
import { parseCreateTriggerScript } from "@/drivers/sqlite/sql-parse-trigger";
import CommonSQLImplement from "./common-sql-imp";

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
            schemaName: "main",
            name: row.name,
            tableSchema: parseCreateTableScript(row.sql),
          });
        } catch {
          tmp.push({ type: "table", name: row.name, schemaName: "main" });
        }
      } else if (row.type === "trigger") {
        tmp.push({
          type: "trigger",
          name: row.name,
          tableName: row.tbl_name,
          schemaName: "main",
        });
      } else if (row.type === "view") {
        tmp.push({ type: "view", name: row.name, schemaName: "main" });
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

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const sql = `SELECT * FROM sqlite_schema WHERE tbl_name = ${escapeSqlValue(
      tableName
    )};`;
    const result = await this.query(sql);

    try {
      const rows = result.rows as Array<{ type: string; sql: string }>;
      const def = rows.find((row) => row.type === "table");
      if (def) {
        const createScript = def.sql;
        return {
          ...parseCreateTableScript(createScript),
          createScript,
          schemaName,
        };
      }

      throw new Error("Unexpected error finding table " + tableName);
    } catch (e) {
      throw new Error("Unexpected error while parsing");
    }
  }
}

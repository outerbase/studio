import { escapeSqlValue } from "@/lib/sql-helper";
import { parseCreateTableScript } from "@/lib/sql-parse-table";
import * as hrana from "@libsql/hrana-client";

export type DatabaseValue<T = unknown> = T | undefined | null;

export interface DatabaseSchemaItem {
  name: string;
}

export interface DatabaseTableColumn {
  name: string;
  type: string;
  pk?: boolean;
  constraint?: DatabaseTableColumnConstraint;
}

export type DatabaseColumnConflict =
  | "ROLLBACK"
  | "ABORT"
  | "FAIL"
  | "IGNORE"
  | "REPLACE";

export interface DatabaseForeignKeyCaluse {
  foreignTableName: string;
  foreignColumns: string[];
  columns?: string[];
}

export interface DatabaseTableColumnConstraint {
  name?: string;

  primaryKey?: boolean;
  primaryColumns?: string[];
  primaryKeyOrder?: "ASC" | "DESC";
  primaryKeyConflict?: DatabaseColumnConflict;
  autoIncrement?: boolean;

  notNull?: boolean;
  notNullConflict?: DatabaseColumnConflict;

  unique?: boolean;
  uniqueConflict?: DatabaseColumnConflict;

  checkExpression?: string;

  defaultValue?: unknown;
  defaultExpression?: string;

  collate?: string;

  generatedExpression?: string;
  generatedType?: "STORED" | "VIRTUAL";

  foreignKey?: DatabaseForeignKeyCaluse;
}

export interface DatabaseTableSchema {
  columns: DatabaseTableColumn[];
  pk: string[];
  autoIncrement: boolean;
  tableName?: string;
  constraints?: DatabaseTableColumnConstraint[];
}

export default class DatabaseDriver {
  protected client: hrana.WsClient;
  protected stream?: hrana.WsStream;
  protected endpoint: string = "";

  constructor(url: string, authToken: string) {
    this.endpoint = url;
    this.client = hrana.openWs(url, authToken);
  }

  protected escapeId(id: string) {
    return id.replace(/"/g, '""');
  }

  protected getStream(): hrana.WsStream {
    if (this.stream) {
      if (this.stream.closed) {
        console.info("Open Stream");
        this.stream = this.client.openStream();
      }
    } else {
      console.info("Open Stream");
      this.stream = this.client.openStream();
    }

    return this.stream;
  }

  getEndpoint() {
    return this.endpoint;
  }

  async query(stmt: hrana.InStmt) {
    const stream = this.getStream();

    console.info("Querying", stmt);
    const r = await stream.query(stmt);
    console.info("Result", r);

    return r;
  }

  close() {
    if (this.stream) this.stream.close();
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
    const result = await this.query([sql, binding]);

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
        return parseCreateTableScript(def.sql as string);
      }
    } catch (e) {
      console.error(e);
    }

    return await this.legacyTableSchema(tableName);
  }

  async selectFromTable(
    tableName: string,
    options: {
      limit: number;
      offset: number;
    }
  ): Promise<hrana.RowsResult> {
    const sql = `SELECT * FROM ${this.escapeId(tableName)} LIMIT ? OFFSET ?;`;
    const binding = [options.limit, options.offset];
    return await this.query([sql, binding]);
  }
}

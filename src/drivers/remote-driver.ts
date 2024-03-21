import { escapeSqlValue } from "@/lib/sql-helper";
import { parseCreateTableScript } from "@/lib/sql-parse-table";
import { InStatement, ResultSet, Row } from "@libsql/client/web";
import {
  BaseDriver,
  DatabaseSchemaItem,
  DatabaseTableColumn,
  DatabaseTableSchema,
  SelectFromTableOptions,
} from "./base-driver";
import {
  ApiOpsBatchResponse,
  ApiOpsQueryResponse,
  ApiSchemaListResponse,
} from "@/lib/api-response-types";

export default class RemoteDriver implements BaseDriver {
  protected id: string = "";
  protected authToken = "";
  protected name = "";

  constructor(id: string, authToken: string, name: string) {
    this.id = id;
    this.authToken = authToken;
    this.name = name;
  }

  protected transformRawResult(raw: ResultSet): ResultSet {
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

  protected escapeId(id: string) {
    return id.replace(/"/g, '""');
  }

  getEndpoint() {
    return this.name;
  }

  async query(stmt: InStatement) {
    console.info("Querying", stmt);

    const r = await fetch(`/api/ops/${this.id}/query`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(typeof stmt === "string" ? { sql: stmt } : stmt),
    });
    const json: ApiOpsQueryResponse = await r.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return this.transformRawResult(json.data);
  }

  async transaction(stmt: InStatement[]) {
    const r = await fetch(`/api/ops/${this.id}/batch`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ batch: stmt }),
    });

    const json: ApiOpsBatchResponse = await r.json();
    if (json.error) {
      throw new Error(json.error);
    }

    return json.data.map(this.transformRawResult);
  }

  close() {}

  async getTableList(): Promise<DatabaseSchemaItem[]> {
    const r = await fetch(`/api/ops/${this.id}/schema`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.authToken,
      },
    });

    const json: ApiSchemaListResponse = await r.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json.data;
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

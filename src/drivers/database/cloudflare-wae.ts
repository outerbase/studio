import { ColumnHeader, ColumnType } from "@outerbase/sdk-transform";
import {
  DatabaseResultSet,
  DatabaseSchemas,
  DatabaseTableColumn,
  DatabaseTableSchema,
  DriverFlags,
  QueryableBaseDriver,
  SelectFromTableOptions,
} from "../base-driver";
import PostgresLikeDriver from "../postgres/postgres-driver";

interface CloudflareWAEResponseMeta {
  name: string;
  type: "UInt32" | "String" | "Float64" | "DateTime";
}

interface CloudflareWAEResponse {
  meta: CloudflareWAEResponseMeta[];
  data: Record<string, unknown>[];
  error?: string;
}

const WAEGenericColumns: DatabaseTableColumn[] = [
  { name: "_sample_interval", type: "UInt32" },
  { name: "timestamp", type: "DateTime" },
  { name: "dataset", type: "String" },
  { name: "index1", type: "String" },
  { name: "blob1", type: "String" },
  { name: "blob2", type: "String" },
  { name: "blob3", type: "String" },
  { name: "blob4", type: "String" },
  { name: "blob5", type: "String" },
  { name: "blob6", type: "String" },
  { name: "blob7", type: "String" },
  { name: "blob8", type: "String" },
  { name: "blob9", type: "String" },
  { name: "blob10", type: "String" },
  { name: "blob11", type: "String" },
  { name: "blob12", type: "String" },
  { name: "blob13", type: "String" },
  { name: "blob14", type: "String" },
  { name: "blob15", type: "String" },
  { name: "blob16", type: "String" },
  { name: "blob17", type: "String" },
  { name: "blob18", type: "String" },
  { name: "blob19", type: "String" },
  { name: "blob20", type: "String" },
  { name: "double1", type: "Float64" },
  { name: "double2", type: "Float64" },
  { name: "double3", type: "Float64" },
  { name: "double4", type: "Float64" },
  { name: "double5", type: "Float64" },
  { name: "double6", type: "Float64" },
  { name: "double7", type: "Float64" },
  { name: "double8", type: "Float64" },
  { name: "double9", type: "Float64" },
  { name: "double10", type: "Float64" },
  { name: "double11", type: "Float64" },
  { name: "double12", type: "Float64" },
  { name: "double13", type: "Float64" },
  { name: "double14", type: "Float64" },
  { name: "double15", type: "Float64" },
  { name: "double16", type: "Float64" },
  { name: "double17", type: "Float64" },
  { name: "double18", type: "Float64" },
  { name: "double19", type: "Float64" },
  { name: "double20", type: "Float64" },
];

class WAEQueryable implements QueryableBaseDriver {
  constructor(
    protected accountId: string,
    protected token: string
  ) {}

  async query(stmt: string): Promise<DatabaseResultSet> {
    const r = await fetch("/proxy/wae", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: "Bearer " + this.token,
        "x-account-id": this.accountId,
      },
      body: stmt,
    });

    const json: CloudflareWAEResponse = await r.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return {
      rows: json.data,
      headers: json.meta.map(
        (m) =>
          ({
            name: m.name,
            displayName: m.name,
            originalType: m.type,
            type:
              {
                UInt32: ColumnType.INTEGER,
                String: ColumnType.TEXT,
                Float64: ColumnType.REAL,
                DateTime: ColumnType.TEXT,
              }[m.type] ?? ColumnType.TEXT,
          }) as ColumnHeader
      ),
      stat: {
        rowsAffected: 0,
        rowsRead: 0,
        rowsWritten: 0,
        queryDurationMs: 0,
      },
    };
  }

  async transaction(stmt: string[]): Promise<DatabaseResultSet[]> {
    return Promise.all(stmt.map((s) => this.query(s)));
  }
}

export default class CloudflareWAEDriver extends PostgresLikeDriver {
  getFlags(): DriverFlags {
    return {
      defaultSchema: "main",
      dialect: "sqlite",
      optionalSchema: true,
      supportRowId: false,
      supportBigInt: false,
      supportModifyColumn: false,
      supportCreateUpdateTable: false,
      supportCreateUpdateDatabase: false,
      supportInsertReturning: false,
      supportUpdateReturning: false,
      supportCreateUpdateTrigger: false,
      supportUseStatement: false,
    };
  }

  constructor(
    protected accountId: string,
    protected token: string
  ) {
    super(new WAEQueryable(accountId, token));
  }

  async schemas(): Promise<DatabaseSchemas> {
    const tableList = await this.query("SHOW TABLES");
    const tableListRows = tableList.rows as { dataset: string; type: string }[];

    return {
      main: tableListRows.map((r) => ({
        name: r.dataset,
        schemaName: "main",
        type: "table",
        tableName: r.dataset,
        tableSchema: {
          tableName: r.dataset,
          columns: structuredClone(WAEGenericColumns),
          pk: [],
          autoIncrement: false,
          schemaName: "main",
        },
      })),
    };
  }

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    return {
      columns: structuredClone(WAEGenericColumns),
      tableName,
      pk: [],
      autoIncrement: false,
      schemaName,
    };
  }

  async selectTable(
    schemaName: string,
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }> {
    // Similar to the common SQL driver implementation,
    // but without the schema name as Cloudflare Worker Analytics Engine does not support schemas

    const whereRaw = options.whereRaw?.trim();

    // By default sort by timestamp in descending order
    options.orderBy =
      !options.orderBy || options.orderBy.length === 0
        ? [{ columnName: "timestamp", by: "DESC" }]
        : options.orderBy;

    const orderPart =
      options.orderBy && options.orderBy.length > 0
        ? options.orderBy
            .map((r) => `${this.escapeId(r.columnName)} ${r.by}`)
            .join(", ")
        : "";

    const sql = `SELECT * FROM ${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } ${orderPart ? ` ORDER BY ${orderPart}` : ""}`;

    const schema = await this.tableSchema(schemaName, tableName);
    const data = await this.query(sql);
    data.headers = schema.columns.map((c) => ({
      name: c.name,
      displayName: c.name,
      originalType: c.type,
      type: ColumnType.TEXT,
    }));

    return {
      data: data,
      schema,
    };
  }

  close(): void {
    // do nothing
  }
}

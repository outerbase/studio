import { ColumnType } from "@outerbase/sdk-transform";
import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
} from "./base-driver";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";

interface CloudflareResult {
  results: {
    columns: string[];
    rows: unknown[][];
  };
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface CloudflareResponse {
  error: string;
  result: CloudflareResult[];
}

function transformRawResult(raw: CloudflareResult): DatabaseResultSet {
  const columns = raw.results.columns ?? [];
  const values = raw.results.rows;
  const headerSet = new Set();

  const headers: DatabaseHeader[] = columns.map((colName) => {
    let renameColName = colName;

    for (let i = 0; i < 20; i++) {
      if (!headerSet.has(renameColName)) break;
      renameColName = `__${colName}_${i}`;
    }

    return {
      name: renameColName,
      displayName: colName,
      originalType: "text",
      type: ColumnType.TEXT,
    };
  });

  const rows = values
    ? values.map((r) =>
      headers.reduce((a, b, idx) => {
        a[b.name] = r[idx];
        return a;
      }, {} as DatabaseRow)
    )
    : [];

  return {
    rows,
    stat: {
      rowsAffected: raw.meta.changes,
      rowsRead: raw.meta.rows_read,
      rowsWritten: raw.meta.rows_written,
      queryDurationMs: raw.meta.duration,
    },
    headers,
    lastInsertRowid:
      raw.meta.last_row_id === undefined ? undefined : raw.meta.last_row_id,
  };
}

export default class CloudflareD1Driver extends SqliteLikeBaseDriver {
  supportPragmaList: boolean = false;
  protected headers: Record<string, string> = {};
  protected url: string;

  constructor(url: string, headers: Record<string, string>) {
    super();
    this.headers = headers;
    this.url = url;
  }

  async transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const r = await fetch(this.url, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        sql: stmts.join(";"),
      }),
    });

    const json: CloudflareResponse = await r.json();

    if (json.error) throw new Error(json.error);

    return json.result.map(transformRawResult);
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    return (await this.transaction([stmt]))[0];
  }
}

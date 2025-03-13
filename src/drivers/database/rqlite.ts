import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  QueryableBaseDriver,
} from "@/drivers/base-driver";
import { convertSqliteType } from "../sqlite/sql-helper";

interface RqliteResult {
  columns?: string[];
  types?: string[];
  values?: unknown[][];
  last_insert_id?: number;
  rows_affected?: number;
  time?: number;
  error?: string;
}

interface RqliteResultSet {
  results: RqliteResult[];
}

export function transformRawResult(raw: RqliteResult): DatabaseResultSet {
  const columns = raw.columns ?? [];
  const types = raw.types ?? [];
  const values = raw.values;
  const headerSet = new Set();

  const headers: DatabaseHeader[] = columns.map((colName, colIdx) => {
    const colType = types[colIdx];

    let renameColName = colName;

    for (let i = 0; i < 20; i++) {
      if (!headerSet.has(renameColName)) break;
      renameColName = `__${colName}_${i}`;
    }

    return {
      name: renameColName,
      displayName: colName,
      originalType: colType,
      type: convertSqliteType(colType),
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
      rowsAffected: raw?.rows_affected ?? 0,
      rowsRead: null,
      rowsWritten: null,
      queryDurationMs: raw?.time ?? 0,
    },
    headers,
    lastInsertRowid:
      raw.last_insert_id === undefined ? undefined : raw.last_insert_id,
  };
}

export class RqliteQueryable implements QueryableBaseDriver {
  constructor(
    protected endpoint: string,
    protected username?: string,
    protected password?: string
  ) {}

  async transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    let headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.username) {
      headers = {
        ...headers,
        Authorization: "Basic " + btoa(this.username + ":" + this.password),
      };
    }

    // https://rqlite.io/docs/api/api/#unified-endpoint
    const result = await fetch(this.endpoint + "/db/request?timings", {
      method: "POST",
      headers,
      body: JSON.stringify(
        stmts.map((s) => {
          return [s];
        })
      ),
    });

    const json: RqliteResultSet = await result.json();

    for (const r of json.results) {
      if (r.error) throw new Error(r.error);
    }

    return json.results.map(transformRawResult);
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    return (await this.transaction([stmt]))[0];
  }
}

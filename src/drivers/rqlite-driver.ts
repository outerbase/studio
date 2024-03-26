import { InStatement } from "@libsql/client";
import { DatabaseHeader, DatabaseResultSet, DatabaseRow } from "./base-driver";
import SqliteLikeBaseDriver from "./sqlite-base-driver";
import { convertSqliteType } from "@/lib/sql-helper";

interface RqliteResult {
  columns?: string[];
  types?: string[];
  values?: unknown[][];
  last_insert_id?: number;
  rows_affected?: number;
  error?: string;
}

interface RqliteResultSet {
  results: RqliteResult[];
}

export function transformRawResult(raw: RqliteResult): DatabaseResultSet {
  const columns = raw.columns ?? [];
  const types = raw.types ?? [];
  const values = raw.values;

  const rows = values
    ? values.map((r) =>
        columns.reduce((a, b, idx) => {
          a[b] = r[idx];
          return a;
        }, {} as DatabaseRow)
      )
    : [];

  const headers: DatabaseHeader[] = columns.map((colName, colIdx) => {
    const colType = types[colIdx];

    return {
      name: colName,
      originalType: colType,
      type: convertSqliteType(colType),
    };
  });

  return {
    rows,
    rowsAffected: raw?.rows_affected ?? 0,
    headers,
    lastInsertRowid:
      raw.last_insert_id === undefined ? undefined : raw.last_insert_id,
  };
}

export default class RqliteDriver extends SqliteLikeBaseDriver {
  protected endpoint: string;
  protected username?: string;
  protected password?: string;

  constructor(url: string, username?: string, password?: string) {
    super();
    this.endpoint = url;
    this.username = username;
    this.password = password;
  }

  async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
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
    const result = await fetch(this.endpoint + "/db/request", {
      method: "POST",
      headers,
      body: JSON.stringify(
        stmts.map((s) => {
          if (typeof s === "string") return [s];
          else if (Array.isArray(s.args)) return [s.sql, ...s.args];
          return [s.sql, s.args];
        })
      ),
    });

    const json: RqliteResultSet = await result.json();

    for (const r of json.results) {
      if (r.error) throw new Error(r.error);
    }

    return json.results.map(transformRawResult);
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    return (await this.transaction([stmt]))[0];
  }

  close(): void {
    // do nothing
  }
}

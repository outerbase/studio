import { InStatement } from "@libsql/client";
import {
  SqliteLikeBaseDriver,
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  convertSqliteType,
} from "@libsqlstudio/gui/driver";

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
    const result = await fetch(this.endpoint + "/db/request?timings", {
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

  supportBigInt(): boolean {
    return false;
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    return (await this.transaction([stmt]))[0];
  }

  close(): void {
    // do nothing
  }
}

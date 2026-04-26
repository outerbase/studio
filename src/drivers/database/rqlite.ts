import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  QueryableBaseDriver,
} from "@/drivers/base-driver";
import { convertSqliteType } from "../sqlite/sql-helper";
import { HttpStatus } from "@/constants/http-status";

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

interface RqliteStatusResponse {
  node?: {
    start_time?: string;
  };
  cluster?: {
    addr?: string;
  };
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
    headers,
    rows,
    lastInsertRowId: raw.last_insert_id,
    rowsAffected: raw.rows_affected,
    executionTimeMs: raw.time,
    error: raw.error,
  };
}

export class RqliteDriver extends QueryableBaseDriver {
  private baseUrl: string;

  constructor(
    private host: string,
    private port: number,
    private username: string,
    private password: string,
    private useSSL: boolean = false
  ) {
    super();
    const protocol = useSSL ? "https" : "http";
    this.baseUrl = `${protocol}://${this.host}:${this.port}`;
  }

  async testConnection(): Promise<boolean> {
    const rootUrl = `${this.baseUrl}/`;
    const statusUrl = `${this.baseUrl}/status`;

    try {
      const rootResponse = await fetch(rootUrl, { method: "GET", redirect: "manual" });
      if (rootResponse.status !== HttpStatus.FOUND) {
        return false;
      }

      const versionHeader = rootResponse.headers.get("X-Rqlite-Version");
      if (!versionHeader) {
        return false;
      }

      const location = rootResponse.headers.get("Location");
      if (!location || location !== "/status") {
        return false;
      }

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
        },
      });

      if (!statusResponse.ok) {
        return false;
      }

      const statusData: RqliteStatusResponse = await statusResponse.json();
      if (!statusData.node || !statusData.cluster) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async query(sql: string): Promise<DatabaseResultSet[]> {
    const url = `${this.baseUrl}/db/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      },
      body: JSON.stringify({ statements: sql }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: RqliteResultSet = await response.json();
    return result.results.map(transformRawResult);
  }

  async execute(sql: string): Promise<DatabaseResultSet[]> {
    const url = `${this.baseUrl}/db/execute`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      },
      body: JSON.stringify({ statements: sql }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: RqliteResultSet = await response.json();
    return result.results.map(transformRawResult);
  }
}
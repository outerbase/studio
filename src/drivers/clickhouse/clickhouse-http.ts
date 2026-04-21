import { ColumnType } from "@outerbase/sdk-transform";
import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  QueryableBaseDriver,
} from "../base-driver";

export interface ClickHouseHttpConfig {
  /**
   * Base URL of the ClickHouse HTTP interface, e.g. `http://localhost:8123`
   * or `https://<cluster>.clickhouse.cloud:8443`. No trailing slash required.
   */
  url: string;
  username?: string;
  password?: string;
  /** Optional default database (mapped to the `database` query param). */
  database?: string;
}

interface ClickHouseJSONResponse {
  meta?: { name: string; type: string }[];
  data?: unknown[][];
  rows?: number;
  rows_before_limit_at_least?: number;
  statistics?: {
    elapsed?: number;
    rows_read?: number;
    bytes_read?: number;
  };
}

/**
 * Map a ClickHouse type string (e.g. `Nullable(UInt64)`, `LowCardinality(String)`,
 * `Array(String)`) to the column-type enum used by the Studio UI.
 *
 * ClickHouse types may be nested through wrappers — we repeatedly peel them
 * off to find the underlying base type.
 */
export function clickhouseTypeToColumnType(raw: string): ColumnType {
  if (!raw) return ColumnType.TEXT;

  let t = raw.trim();
  // Peel Nullable(...) and LowCardinality(...) wrappers
  const wrappers = ["Nullable", "LowCardinality"];
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of wrappers) {
      if (t.startsWith(w + "(") && t.endsWith(")")) {
        t = t.slice(w.length + 1, -1).trim();
        changed = true;
      }
    }
  }

  // Array / Map / Tuple / JSON → treat as text for display purposes
  if (
    t.startsWith("Array(") ||
    t.startsWith("Map(") ||
    t.startsWith("Tuple(") ||
    t === "JSON" ||
    t.startsWith("Nested(")
  ) {
    return ColumnType.TEXT;
  }

  // Numeric families
  if (/^U?Int(8|16|32|64|128|256)$/.test(t)) return ColumnType.INTEGER;
  if (/^Float(32|64)$/.test(t)) return ColumnType.REAL;
  if (t.startsWith("Decimal")) return ColumnType.REAL;
  if (t === "Bool" || t === "Boolean") return ColumnType.INTEGER;

  // Strings
  if (t === "String" || t.startsWith("FixedString") || t === "UUID") {
    return ColumnType.TEXT;
  }

  // Dates
  if (t === "Date" || t === "Date32") return ColumnType.TEXT;
  if (t === "DateTime" || t.startsWith("DateTime(") || t.startsWith("DateTime64"))
    return ColumnType.TEXT;

  // IP addresses / Enums / everything else → text
  return ColumnType.TEXT;
}

function btoaUnicode(str: string): string {
  // Edge/browser-safe base64 encoding of UTF-8 input.
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(str)));
  }
  // Fallback for any Node-only execution path during tests.
  return Buffer.from(str, "utf-8").toString("base64");
}

/**
 * `QueryableBaseDriver` backed by ClickHouse's HTTP interface.
 * Uses native `fetch` so it works in both the browser and Cloudflare
 * Workers / Edge runtime without pulling in a Node-only client.
 */
export class ClickHouseHttpQueryable implements QueryableBaseDriver {
  constructor(protected config: ClickHouseHttpConfig) {}

  /**
   * Update the default database for subsequent requests. Called by the
   * driver when the user switches DB in the sidebar (the stateless HTTP
   * interface forgets `USE <db>` across requests, so we carry it ourselves).
   */
  setDatabase(db: string): void {
    this.config = { ...this.config, database: db || undefined };
  }

  getDatabase(): string | undefined {
    return this.config.database;
  }

  private buildUrl(): string {
    const base = this.config.url.replace(/\/$/, "");
    const params = new URLSearchParams();
    params.set("default_format", "JSONCompact");
    if (this.config.database) {
      params.set("database", this.config.database);
    }
    return `${base}/?${params.toString()}`;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=UTF-8",
    };
    if (this.config.username !== undefined) {
      const token = btoaUnicode(
        `${this.config.username}:${this.config.password ?? ""}`
      );
      headers["Authorization"] = `Basic ${token}`;
    }
    return headers;
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const res = await fetch(this.buildUrl(), {
      method: "POST",
      headers: this.buildHeaders(),
      body: stmt,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `ClickHouse HTTP ${res.status}: ${text.trim() || res.statusText}`
      );
    }

    const end =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const queryDurationMs = Math.round(end - start);

    const text = await res.text();

    // Non-SELECT statements (INSERT, DDL, etc.) return an empty body.
    if (!text.trim()) {
      return {
        headers: [],
        rows: [],
        stat: {
          rowsAffected: 0,
          rowsRead: null,
          rowsWritten: null,
          queryDurationMs,
        },
      };
    }

    let json: ClickHouseJSONResponse;
    try {
      json = JSON.parse(text);
    } catch {
      // Unexpected non-JSON body — surface as an error rather than silently
      // dropping the result.
      throw new Error(
        `ClickHouse returned non-JSON response: ${text.slice(0, 200)}`
      );
    }

    const meta = json.meta ?? [];
    const headers: DatabaseHeader[] = meta.map((m) => ({
      name: m.name,
      displayName: m.name,
      originalType: m.type,
      type: clickhouseTypeToColumnType(m.type),
    }));

    const rows: DatabaseRow[] = (json.data ?? []).map((row) =>
      headers.reduce((acc, h, idx) => {
        acc[h.name] = row[idx] as unknown;
        return acc;
      }, {} as DatabaseRow)
    );

    return {
      headers,
      rows,
      stat: {
        rowsAffected: rows.length,
        rowsRead: json.statistics?.rows_read ?? null,
        rowsWritten: null,
        queryDurationMs:
          json.statistics?.elapsed !== undefined
            ? Math.round(json.statistics.elapsed * 1000)
            : queryDurationMs,
      },
    };
  }

  async transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    // ClickHouse does not have general-purpose ACID transactions; run
    // statements sequentially and fail fast on the first error.
    const out: DatabaseResultSet[] = [];
    for (const s of stmts) {
      out.push(await this.query(s));
    }
    return out;
  }

  async batch(stmts: string[]): Promise<DatabaseResultSet[]> {
    const out: DatabaseResultSet[] = [];
    for (const s of stmts) {
      out.push(await this.query(s));
    }
    return out;
  }
}

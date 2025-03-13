import { transformCloudflareD1 } from "@outerbase/sdk-transform";
import { DatabaseResultSet, QueryableBaseDriver } from "../base-driver";

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

export class CloudflareD1Queryable implements QueryableBaseDriver {
  constructor(
    protected url: string,
    protected headers: Record<string, string>
  ) {
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
    return json.result.map(transformCloudflareD1);
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    return (await this.transaction([stmt]))[0];
  }
}

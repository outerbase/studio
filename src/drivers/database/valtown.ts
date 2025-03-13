import { DatabaseResultSet, QueryableBaseDriver } from "@/drivers/base-driver";
import { InStatement, ResultSet } from "@libsql/client";
import { transformRawResult } from "./turso";

export class ValtownQueryable implements QueryableBaseDriver {
  constructor(protected token: string) {}

  async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
    const r = await fetch(`https://api.val.town/v1/sqlite/batch`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statements: stmts,
        mode: "write",
      }),
    });

    const json = await r.json();
    return json.map(transformRawResult);
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    const r = await fetch(`https://api.val.town/v1/sqlite/execute`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statement: stmt }),
    });

    const json = await r.json();

    return transformRawResult(json as ResultSet);
  }
}

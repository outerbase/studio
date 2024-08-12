import { InStatement, ResultSet } from "@libsql/client";
import { transformRawResult } from "./turso-driver";
import { DatabaseResultSet } from "@/drivers/base-driver";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";

export default class ValtownDriver extends SqliteLikeBaseDriver {
  protected token: string;

  constructor(token: string) {
    super();
    this.token = token;
  }

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

  close(): void {
    // do nothing
  }
}

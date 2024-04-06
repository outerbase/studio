import { convertSqliteType } from "@/lib/sql-helper";
import {
  createClient,
  Client,
  InStatement,
  ResultSet,
} from "@libsql/client/web";
import { DatabaseHeader, DatabaseResultSet, DatabaseRow } from "./base-driver";
import SqliteLikeBaseDriver from "./sqlite-base-driver";

export function transformRawResult(raw: ResultSet): DatabaseResultSet {
  const rows = raw.rows.map((r) =>
    raw.columns.reduce((a, b, idx) => {
      a[b] = r[idx];
      return a;
    }, {} as DatabaseRow)
  );

  const headers: DatabaseHeader[] = raw.columns.map((colName, colIdx) => {
    const colType = raw.columnTypes[colIdx];

    return {
      name: colName,
      originalType: colType,
      type: convertSqliteType(colType),
    };
  });

  return {
    rows,
    rowsAffected: raw.rowsAffected,
    headers,
    lastInsertRowid:
      raw.lastInsertRowid === undefined
        ? undefined
        : Number(raw.lastInsertRowid),
  };
}

export default class TursoDriver extends SqliteLikeBaseDriver {
  protected client: Client;
  protected endpoint: string = "";
  protected authToken = "";
  protected bigInt = false;

  constructor(url: string, authToken: string, bigInt: boolean = false) {
    super();
    this.endpoint = url;
    this.authToken = authToken;
    this.bigInt = bigInt;

    this.client = createClient({
      url: this.endpoint,
      authToken: this.authToken,
      intMode: bigInt ? "bigint" : "number",
    });
  }

  supportBigInt(): boolean {
    return this.bigInt;
  }

  async query(stmt: InStatement) {
    const stream = this.client;
    const r = await stream.execute(stmt);
    return transformRawResult(r);
  }

  async transaction(stmt: InStatement[]) {
    return (await this.client.batch(stmt, "write")).map(transformRawResult);
  }
}

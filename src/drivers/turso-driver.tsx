import { convertSqliteType } from "@/lib/sql-helper";
import {
  createClient,
  Client,
  InStatement,
  ResultSet,
  Row,
} from "@libsql/client/web";
import { DatabaseHeader, DatabaseResultSet } from "./base-driver";
import SqliteLikeBaseDriver from "./sqlite-base-driver";

export function transformRawResult(raw: ResultSet): DatabaseResultSet {
  const rows = raw.rows.map((r) =>
    raw.columns.reduce((a, b, idx) => {
      a[b] = r[idx];
      return a;
    }, {} as Row)
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

  constructor(url: string, authToken: string) {
    super();
    this.endpoint = url;
    this.authToken = authToken;

    this.client = createClient({
      url: this.endpoint,
      authToken: this.authToken,
    });
  }

  getEndpoint() {
    return this.endpoint;
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

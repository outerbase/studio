import {
  createClient,
  Client,
  InStatement,
  ResultSet,
} from "@libsql/client/web";
import {
  SqliteLikeBaseDriver,
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  convertSqliteType,
} from "@libsqlstudio/gui/driver";

export function transformRawResult(raw: ResultSet): DatabaseResultSet {
  const headerSet = new Set();

  const headers: DatabaseHeader[] = raw.columns.map((colName, colIdx) => {
    const colType = raw.columnTypes[colIdx];
    let renameColName = colName;

    for (let i = 0; i < 20; i++) {
      if (!headerSet.has(renameColName)) break;
      renameColName = `__${colName}_${i}`;
    }

    headerSet.add(renameColName);

    return {
      name: renameColName,
      displayName: colName,
      originalType: colType,
      type: convertSqliteType(colType),
    };
  });

  const rows = raw.rows.map((r) =>
    headers.reduce((a, b, idx) => {
      a[b.name] = r[idx];
      return a;
    }, {} as DatabaseRow)
  );

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

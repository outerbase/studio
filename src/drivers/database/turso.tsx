import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  DriverFlags,
  QueryableBaseDriver,
} from "@/drivers/base-driver";
import { Client, InStatement, ResultSet } from "@libsql/client/web";
import { createClient as createClientStateless } from "libsql-stateless-easy";
import { SqliteLikeBaseDriver } from "../sqlite-base-driver";
import { convertSqliteType } from "../sqlite/sql-helper";

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
      const cellValue = r[idx];
      if (cellValue instanceof Uint8Array) {
        a[b.name] = Array.from(cellValue);
      } else {
        a[b.name] = r[idx];
      }
      return a;
    }, {} as DatabaseRow)
  );

  return {
    rows,
    stat: {
      rowsAffected: raw.rowsAffected,

      // This is unique for stateless driver
      rowsRead: (raw as any).rowsRead ?? null,
      rowsWritten: (raw as any).rowsWritten ?? null,
      queryDurationMs: (raw as any).queryDurationMS ?? null,
    },

    headers,
    lastInsertRowid:
      raw.lastInsertRowid === undefined
        ? undefined
        : Number(raw.lastInsertRowid),
  };
}

export class TursoQueryable implements QueryableBaseDriver {
  constructor(protected client: Client) {
    this.client = client;
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

export default class TursoDriver extends SqliteLikeBaseDriver {
  constructor(
    url: string,
    authToken: string,
    protected bigInt: boolean = false
  ) {
    super(
      new TursoQueryable(
        createClientStateless({
          url: url
            .replace(/^libsql:\/\//, "https://")
            .replace(/^ws:\/\//, "http://")
            .replace(/^wss:\/\//, "https://"),
          authToken: authToken,
          intMode: bigInt ? "bigint" : "number",
        })
      ),
      {
        supportBigInt: bigInt,
      }
    );
  }

  override getFlags(): DriverFlags {
    return {
      ...super.getFlags(),
      supportBigInt: this.bigInt,
      supportModifyColumn: true,
    };
  }
}

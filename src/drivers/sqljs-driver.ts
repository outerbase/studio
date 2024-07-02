import { InStatement } from "@libsql/client";
import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  TableColumnDataType,
} from "@/drivers/base-driver";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";
import { BindParams, Database } from "sql.js";

export default class SqljsDriver extends SqliteLikeBaseDriver {
  protected db: Database;
  protected username?: string;
  protected password?: string;

  constructor(sqljs: Database) {
    super();
    this.db = sqljs;
  }

  async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
    const r: DatabaseResultSet[] = [];

    for (const s of stmts) {
      r.push(await this.query(s));
    }

    return r;
  }

  supportBigInt(): boolean {
    return false;
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    const sql = typeof stmt === "string" ? stmt : stmt.sql;
    const bind =
      typeof stmt === "string" ? undefined : (stmt.args as BindParams);

    const startTime = Date.now();
    const s = this.db.prepare(sql, bind);

    // Do the transform result here
    const headerName = s.getColumnNames();
    const headerSet = new Set();

    const headers: DatabaseHeader[] = headerName.map((colName) => {
      let renameColName = colName;

      for (let i = 0; i < 20; i++) {
        if (!headerSet.has(renameColName)) break;
        renameColName = `__${colName}_${i}`;
      }

      return {
        name: renameColName,
        displayName: colName,
        originalType: "text",
        type: TableColumnDataType.TEXT,
      };
    });

    const rows: DatabaseRow[] = [];
    while (s.step()) {
      const r = s.get();
      rows.push(
        headers.reduce((a, b, idx) => {
          a[b.name] = r[idx];
          return a;
        }, {} as DatabaseRow)
      );
    }

    const endTime = Date.now();

    return {
      headers,
      rows,
      stat: {
        rowsAffected: this.db.getRowsModified(),
        rowsRead: null,
        rowsWritten: null,
        queryDurationMs: endTime - startTime,
      },
      lastInsertRowid:
        headers.length > 0
          ? undefined
          : (this.db.exec("select last_insert_rowid();")[0].values[0][0] as
              | number
              | undefined),
    };
  }

  close(): void {
    // do nothing
  }
}

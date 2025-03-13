import {
  DatabaseHeader,
  DatabaseResultSet,
  DatabaseRow,
  QueryableBaseDriver,
} from "@/drivers/base-driver";
import { InStatement } from "@libsql/client";
import { BindParams, Database } from "sql.js";
import { SqliteLikeBaseDriver } from "../sqlite-base-driver";

class SqljsQueryable implements QueryableBaseDriver {
  public hasRowsChanged: boolean = false;

  constructor(protected db: Database) {}

  async transaction(stmts: InStatement[]): Promise<DatabaseResultSet[]> {
    const r: DatabaseResultSet[] = [];

    for (const s of stmts) {
      r.push(await this.query(s));
    }

    return r;
  }

  async query(stmt: InStatement): Promise<DatabaseResultSet> {
    const sql = typeof stmt === "string" ? stmt : stmt.sql;
    const bind =
      typeof stmt === "string" ? undefined : (stmt.args as BindParams);

    const startTime = Date.now();
    const s = this.db.prepare(sql, bind);
    const endTime = Date.now();

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
        originalType: null,
        type: undefined,
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

    if (this.db.getRowsModified() > 0) {
      this.hasRowsChanged = true;
    }

    return {
      headers,
      rows,
      stat: {
        rowsAffected: headers.length === 0 ? this.db.getRowsModified() : 0,
        rowsRead: null,
        rowsWritten: null,
        queryDurationMs: endTime - startTime,
      },
    };
  }
}

export default class SqljsDriver extends SqliteLikeBaseDriver {
  protected queryable: SqljsQueryable;

  constructor(sqljs: Database) {
    const queryable = new SqljsQueryable(sqljs);
    super(queryable);

    this.queryable = queryable;
  }

  reload(sqljs: Database) {
    this.queryable = new SqljsQueryable(sqljs);
    this._db = this.queryable;
  }

  resetChange() {
    this.queryable.hasRowsChanged = false;
  }

  hasChanged() {
    return this.queryable.hasRowsChanged;
  }
}

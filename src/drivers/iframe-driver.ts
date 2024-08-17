import { DatabaseResultSet } from "./base-driver";
import MySQLLikeDriver from "./mysql/mysql-driver";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";

type ParentResponseData =
  | {
      type: "query";
      id: number;
      data: DatabaseResultSet;
      error?: string;
    }
  | {
      type: "transaction";
      id: number;
      data: DatabaseResultSet[];
      error?: string;
    };

type PromiseResolveReject = {
  resolve: (value: any) => void;
  reject: (value: string) => void;
};

class IframeConnection {
  protected counter = 0;
  protected queryPromise: Record<number, PromiseResolveReject> = {};

  listen() {
    const handler = (e: MessageEvent<ParentResponseData>) => {
      if (e.data.error) {
        this.queryPromise[e.data.id].reject(e.data.error);
        delete this.queryPromise[e.data.id];
      } else {
        this.queryPromise[e.data.id].resolve(e.data.data);
        delete this.queryPromise[e.data.id];
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }

  query(stmt: string): Promise<DatabaseResultSet> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      this.queryPromise[id] = { resolve, reject };

      console.log(
        "POST " +
          {
            type: "query",
            id,
            statement: stmt,
          }
      );

      window.parent.postMessage(
        {
          type: "query",
          id,
          statement: stmt,
        },
        "*"
      );
    });
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      this.queryPromise[id] = { resolve, reject };

      console.log(
        "POST " +
          {
            type: "transaction",
            id,
            statement: stmts,
          }
      );

      window.parent.postMessage(
        {
          type: "transaction",
          id,
          statements: stmts,
        },
        "*"
      );
    });
  }
}

export class IframeSQLiteDriver extends SqliteLikeBaseDriver {
  protected conn = new IframeConnection();
  listen = this.conn.listen;
  query = this.conn.query;
  transaction = this.conn.transaction;
  close() {}
}

export class IframeMySQLDriver extends MySQLLikeDriver {
  protected conn = new IframeConnection();

  listen() {
    this.conn.listen();
  }

  close(): void {}

  async query(stmt: string): Promise<DatabaseResultSet> {
    const r = await this.conn.query(stmt);
    console.log(r);
    return r;
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const r = this.conn.transaction(stmts);
    console.log(r);
    return r;
  }
}

"use client";
import { DatabaseResultSet, QueryableBaseDriver } from "./base-driver";

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
      // Make no sense to handle message with no matching id
      // This throw a lot of error in console for some reason
      if (!this.queryPromise[e.data.id]) return;

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

class ElectronConnection {
  listen() {
    // do nothing here
  }

  query(stmt: string): Promise<DatabaseResultSet> {
    return window.outerbaseIpc!.query(stmt);
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return window.outerbaseIpc!.transaction(stmts);
  }
}

export class EmbedQueryable implements QueryableBaseDriver {
  protected conn =
    typeof window !== "undefined" && window?.outerbaseIpc
      ? new ElectronConnection()
      : new IframeConnection();

  listen() {
    this.conn.listen();
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    const r = await this.conn.query(stmt);
    return r;
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const r = this.conn.transaction(stmts);
    return r;
  }
}

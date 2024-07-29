import { DatabaseResultSet } from "./base-driver";
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

export default class IframeDriver extends SqliteLikeBaseDriver {
  protected counter = 0;
  protected queryPromise: Record<number, PromiseResolveReject> = {};

  /**
   * This will listen to the parent window response
   */
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

      window.parent.postMessage({
        type: "query",
        id,
        statement: stmt,
      });
    });
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      this.queryPromise[id] = { resolve, reject };

      window.parent.postMessage({
        type: "transaction",
        id,
        statements: stmts,
      });
    });
  }

  supportBigInt(): boolean {
    return false;
  }

  close(): void {
    // do nothing
  }
}

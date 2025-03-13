import { DatabaseResultSet, QueryableBaseDriver } from "../base-driver";
import MySQLLikeDriver from "./mysql-driver";

type PromiseResolveReject = {
  resolve: (value: any) => void;
  reject: (value: { message: string }) => void;
};

class MySQLPlaygroundQueryable implements QueryableBaseDriver {
  protected counter = 0;
  protected queryPromise: Record<number, PromiseResolveReject> = {};

  constructor(
    protected ws: WebSocket,
    onReady: () => void
  ) {
    this.ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "ready") {
        onReady();
      } else if (!data.id) {
        console.log("No id in message", data);
        return;
      } else if (!this.queryPromise[data.id]) {
        console.log("No promise for id", data.id);
        return;
      } else if (data.error) {
        this.queryPromise[data.id].reject({ message: data.error });
        delete this.queryPromise[data.id];
      } else {
        this.queryPromise[data.id].resolve(data.data);
        delete this.queryPromise[data.id];
      }
    });
  }

  query(stmt: string): Promise<DatabaseResultSet> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      this.queryPromise[id] = { resolve, reject };

      this.ws.send(
        JSON.stringify({
          id: this.counter,
          type: "query",
          statement: stmt,
        })
      );
    });
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return new Promise((resolve, reject) => {
      const id = ++this.counter;
      this.queryPromise[id] = { resolve, reject };

      this.ws.send(
        JSON.stringify({
          id: this.counter,
          type: "transaction",
          statements: stmts,
        })
      );
    });
  }
}

export default class MySQLPlaygroundDriver extends MySQLLikeDriver {
  protected ws: WebSocket;
  protected counter = 0;
  protected queryPromise: Record<number, PromiseResolveReject> = {};

  constructor(roomName: string, { onReady }: { onReady: () => void }) {
    const ws = new WebSocket(`wss://mysql-playground-ws.fly.dev/${roomName}`);
    super(new MySQLPlaygroundQueryable(ws, onReady));
    this.ws = ws;
  }

  ping(): void {
    console.log("Ping");
    this.ws.send(
      JSON.stringify({
        type: "ping",
      })
    );
  }

  close(): void {
    this.ws.close();
  }
}

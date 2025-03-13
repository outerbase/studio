"use client";
import {
  DatabaseResultSet,
  DriverFlags,
  QueryableBaseDriver,
} from "./base-driver";
import MySQLLikeDriver from "./mysql/mysql-driver";
import PostgresLikeDriver from "./postgres/postgres-driver";
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

class EmbedQueryable implements QueryableBaseDriver {
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

export class IframeSQLiteDriver extends SqliteLikeBaseDriver {
  protected supportBigInt = false;
  protected conn: EmbedQueryable;

  constructor(options?: {
    supportPragmaList?: boolean;
    supportBigInt?: boolean;
  }) {
    const conn = new EmbedQueryable();
    super(conn);
    this.conn = conn;

    if (options?.supportPragmaList !== undefined) {
      this.supportPragmaList = options.supportPragmaList;
    }

    if (options?.supportBigInt !== undefined) {
      this.supportBigInt = options.supportBigInt;
    }
  }

  getFlags(): DriverFlags {
    return {
      ...super.getFlags(),
      supportCreateUpdateTable: true,
      supportModifyColumn: true,
      supportBigInt: this.supportBigInt,
    };
  }

  listen() {
    this.conn.listen();
  }

  close(): void {}
}

export class IframeMySQLDriver extends MySQLLikeDriver {
  protected conn =
    typeof window !== "undefined" && window?.outerbaseIpc
      ? new ElectronConnection()
      : new IframeConnection();

  listen() {
    this.conn.listen();
  }

  close(): void {}

  async query(stmt: string): Promise<DatabaseResultSet> {
    const r = await this.conn.query(stmt);
    return r;
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const r = this.conn.transaction(stmts);
    return r;
  }
}

export class IframeDoltDriver extends IframeMySQLDriver {
  getFlags(): DriverFlags {
    return {
      ...super.getFlags(),
      dialect: "dolt",
    };
  }
}

export class IframePostgresDriver extends PostgresLikeDriver {
  protected conn =
    typeof window !== "undefined" && window?.outerbaseIpc
      ? new ElectronConnection()
      : new IframeConnection();

  listen() {
    this.conn.listen();
  }

  close(): void {}

  async query(stmt: string): Promise<DatabaseResultSet> {
    const r = await this.conn.query(stmt);
    return r;
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const r = this.conn.transaction(stmts);
    return r;
  }
}

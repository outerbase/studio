import {
  DatabaseHeader,
  DatabaseResultSet,
  DriverFlags,
} from "@/drivers/base-driver";
import PostgresLikeDriver from "@/drivers/postgres/postgres-driver";
import { runOuterbaseQueryRaw } from "../api";
import { OuterbaseDatabaseConfig } from "../api-type";

function transformObjectBasedResult(arr: Record<string, unknown>[]) {
  const usedColumnName = new Set();
  const columns: DatabaseHeader[] = [];

  // Build the headers based on rows
  arr.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!usedColumnName.has(key)) {
        usedColumnName.add(key);
        columns.push({
          name: key,
          displayName: key,
          originalType: null,
          type: undefined,
        });
      }
    });
  });

  return {
    data: arr,
    headers: columns,
  };
}

export class OuterbasePostgresDriver extends PostgresLikeDriver {
  supportPragmaList = false;

  protected workspaceId: string;
  protected sourceId: string;

  getFlags(): DriverFlags {
    return {
      ...super.getFlags(),
      supportBigInt: false,
    };
  }

  constructor({ workspaceId, sourceId }: OuterbaseDatabaseConfig) {
    super();

    this.workspaceId = workspaceId;
    this.sourceId = sourceId;
  }

  async query(stmt: string): Promise<DatabaseResultSet> {
    const jsonResponse = await runOuterbaseQueryRaw(
      this.workspaceId,
      this.sourceId,
      stmt
    );

    const result = transformObjectBasedResult(jsonResponse.items);

    return {
      rows: result.data,
      headers: result.headers,
      stat: {
        rowsAffected: 0,
        rowsRead: null,
        rowsWritten: null,
        queryDurationMs: null,
      },
      lastInsertRowid: undefined,
    };
  }

  async transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    const result: DatabaseResultSet[] = [];

    for (const stms of stmts) {
      result.push(await this.query(stms));
    }

    return result;
  }

  close() {
    // Nothing to do
  }
}

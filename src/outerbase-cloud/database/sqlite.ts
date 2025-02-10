import { DatabaseResultSet, DriverFlags } from "@/drivers/base-driver";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
import { runOuterbaseQueryBatch, runOuterbaseQueryRaw } from "../api";
import { OuterbaseDatabaseConfig } from "../api-type";
import { transformOuterbaseResult } from "./utils";

export class OuterbaseSqliteDriver extends SqliteLikeBaseDriver {
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

    return transformOuterbaseResult(jsonResponse);
  }

  async batch(stmts: string[]): Promise<DatabaseResultSet[]> {
    return (
      await runOuterbaseQueryBatch(this.workspaceId, this.sourceId, stmts)
    ).map(transformOuterbaseResult);
  }

  async transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return this.batch(stmts);
  }
}

import { DatabaseResultSet, DriverFlags } from "@/drivers/base-driver";
import MySQLLikeDriver from "@/drivers/mysql/mysql-driver";
import { runOuterbaseQueryBatch, runOuterbaseQueryRaw } from "../api";
import { OuterbaseDatabaseConfig } from "../api-type";
import { transformOuterbaseResult } from "./utils";

export class OuterbaseMySQLDriver extends MySQLLikeDriver {
  protected workspaceId: string;
  protected sourceId: string;

  getFlags(): DriverFlags {
    return {
      ...super.getFlags(),
      supportUseStatement: false,
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

  close() {
    // Nothing to do here
  }
}

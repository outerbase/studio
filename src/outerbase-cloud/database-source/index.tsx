import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { createOuterbaseDatabaseDriver } from "@/outerbase-cloud/database/utils";
import { BaseDriver } from "../../drivers/base-driver";
import {
  BoardSource,
  BoardSourceDriver,
} from "../../drivers/board-source/base-source";

export default class OuterbaseBoardSourceDriver implements BoardSourceDriver {
  protected workspace: OuterbaseAPIWorkspace;
  protected sourceDrivers: Record<string, BaseDriver> = {};

  constructor(workspace: OuterbaseAPIWorkspace) {
    this.workspace = workspace;
  }

  sourceList(): BoardSource[] {
    return this.workspace.bases
      .filter((base) => base.sources && base.sources.length > 0)
      .map((base) => {
        return {
          id: base.sources[0].id!,
          name: base.name,
          type: base.sources[0].type!,
        };
      });
  }

  async query(
    sourceId: string,
    statement: string
  ): Promise<Record<string, unknown>[]> {
    const source = this.workspace.bases.find((base) => {
      return (
        base.sources &&
        base.sources.length > 0 &&
        base.sources[0].id === sourceId
      );
    })?.sources[0];

    if (!source) {
      throw new Error("Source does not exist");
    }

    if (!this.sourceDrivers[sourceId]) {
      this.sourceDrivers[sourceId] = createOuterbaseDatabaseDriver(
        source.type,
        {
          workspaceId: this.workspace.id!,
          sourceId,
        }
      );
    }

    const driver = this.sourceDrivers[sourceId]!;
    const result = await driver.query(statement);

    return result.rows;
  }

  cleanup(): void {
    // do nothing
  }
}

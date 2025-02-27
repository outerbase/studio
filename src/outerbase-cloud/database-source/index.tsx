import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { createOuterbaseDatabaseDriver } from "@/outerbase-cloud/database/utils";
import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseSchemas,
} from "../../drivers/base-driver";
import {
  BoardSource,
  BoardSourceDriver,
} from "../../drivers/board-source/base-source";

export default class OuterbaseBoardSourceDriver implements BoardSourceDriver {
  protected workspace: OuterbaseAPIWorkspace;
  protected sourceDrivers: Record<string, BaseDriver> = {};
  protected cacheSchemas: Record<
    string,
    {
      schema: DatabaseSchemas;
      selectedSchema: string;
    }
  > = {};

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

  getDriver(sourceId: string) {
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

    return this.sourceDrivers[sourceId]!;
  }

  async schemas(sourceId: string) {
    const driver = this.getDriver(sourceId);

    if (this.cacheSchemas[sourceId]) {
      return this.cacheSchemas[sourceId];
    }

    this.cacheSchemas[sourceId] = {
      schema: await driver.schemas(),
      selectedSchema: driver.getFlags().defaultSchema,
    };

    return this.cacheSchemas[sourceId];
  }

  async query(sourceId: string, statement: string): Promise<DatabaseResultSet> {
    const driver = this.getDriver(sourceId);
    return await driver.query(statement);
  }

  cleanup(): void {
    // do nothing
  }
}

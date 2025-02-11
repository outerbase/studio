import { BoardDriver } from "@/drivers/board-source/board-driver";
import {
  OuterbaseAPIDashboardDetail,
  OuterbaseAPIWorkspace,
} from "@/outerbase-cloud/api-type";
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
import { updateOuterbaseDashboard } from "../api";

export default class OuterbaseBoardSourceDriver
  implements BoardSourceDriver, BoardDriver
{
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

  async onLayoutSave(
    boardId: string,
    value: OuterbaseAPIDashboardDetail
  ): Promise<unknown> {
    const input = {
      base_id: null,
      chart_ids: Array.from(new Set(value.charts.map((v) => v.id))),
      data: (value as any).data,
      layout: value.layout.map(({ w, h, i, x, y }) => ({ w, h, x, y, i })),
      directory_index: (value as any).directory_index,
      name: value.name,
      type: value.type,
    };

    return await updateOuterbaseDashboard(this.workspace.name, boardId, input);
  }

  async onLayoutRemove(
    chartId: string,
    boardId: string,
    value: OuterbaseAPIDashboardDetail
  ): Promise<unknown> {
    const input = {
      ...value,
      chart_ids: value.chart_ids.filter((f) => f !== chartId),
      layout: value.layout.filter((f) => f.i !== chartId),
    };
    console.log(input);
    return true;
    // await deleteOuterbaseDashboardChart(this.workspace.name, chartId);
    // return await this.onLayoutSave(boardId, {
    //   ...value,
    //   chart_ids: value.chart_ids.filter((f) => f !== chartId),
    //   layout: value.layout.filter((f) => f.i !== chartId),
    // });
  }
}

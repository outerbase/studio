import { ChartValue } from "@/components/chart/chart-type";
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
import {
  deleteOuterbaseDashboardChart,
  updateOuterbaseDashboard,
} from "../api";
import { createOuterbaseDashboardChart } from "../api-board";

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
      chart_ids: value.chart_ids
        ? value.chart_ids
        : Array.from(new Set(value.charts.map((v) => v.id))),
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
    const input: OuterbaseAPIDashboardDetail = {
      ...value,
      chart_ids: value.chart_ids.filter((f) => f !== chartId),
      layout: value.layout.filter((f) => f.i !== chartId),
      charts: value.charts.filter((f) => f.id !== chartId),
    };
    const deleteChart = await deleteOuterbaseDashboardChart(
      this.workspace.name,
      chartId
    );
    if (deleteChart) {
      return await this.onLayoutSave(boardId, input);
    }
    return false;
  }

  async onAddChart(
    boardId: string,
    chart: ChartValue,
    value: OuterbaseAPIDashboardDetail
  ): Promise<ChartValue | undefined> {
    if (!chart.source_id) return;
    if (!chart.type) return;

    const chartValue = {
      source_id: chart.source_id,
      params: {
        ...chart.params,
        source_id: chart.source_id,
        workspace_id: this.workspace.name,
        layers: chart.params.layers.map((layer) => {
          return {
            ...layer,
            type: chart.type!,
          };
        }),
      },
      type: chart.type,
      name: chart.name ?? "",
    };

    const request = await createOuterbaseDashboardChart(
      this.workspace.name,
      chartValue
    );
    if (request.id) {
      await this.onLayoutSave(boardId, {
        ...value,
        chart_ids: [...value.chart_ids, request.id],
        layout: [
          ...value.layout,
          {
            i: request.id,
            x: 0,
            y: 2,
            w: 2,
            h: 2,
            max_h: 0,
            max_w: 0,
          },
        ],
      });

      return request;
    }
  }
}

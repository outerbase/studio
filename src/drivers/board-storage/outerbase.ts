import { DashboardProps } from "@/components/board";
import { ChartParams, ChartValue } from "@/components/chart/chart-type";
import { deleteOuterbaseDashboardChart, updateOuterbaseDashboard } from "@/outerbase-cloud/api";
import { createOuterbaseDashboardChart, updateOuterbaseDashboardChart } from "@/outerbase-cloud/api-board";
import { IBoardStorageDriver } from "./base";

export default class OuterbaseBoardStorageDriver
  implements IBoardStorageDriver
{
  constructor(
    protected workspaceId: string,
    protected boardId: string
  ) {}

  async save(value: DashboardProps): Promise<unknown> {
    const input = {
      base_id: null,
      chart_ids: Array.from(new Set(value.charts.map((v) => v.id))),
      data: (value as any).data,
      layout: value.layout.map(({ w, h, i, x, y }) => ({ w, h, x, y, i })),
      directory_index: (value as any).directory_index,
      name: value.name,
      type: 'dashboard',
    };
    return await updateOuterbaseDashboard(this.workspaceId, this.boardId, input);
  }

  async remove(chartId: string): Promise<unknown> {
    return await deleteOuterbaseDashboardChart(this.workspaceId, chartId);
  }

  async add(chart: ChartValue): Promise<ChartValue> {
    const input = {
      source_id: chart.source_id!,
      params: {
        ...chart.params,
        source_id: chart.source_id,
        workspace_id: this.workspaceId,
        layers: chart.params.layers.map((layer) => {
          return {
            ...layer,
            type: chart.type!,
          };
        }),
      } as ChartParams,
      type: chart.type!,
      name: chart.name ?? "",
    }
    return await createOuterbaseDashboardChart(this.workspaceId, input);
  }

  async update(chartId: string, chart: ChartValue): Promise<ChartValue> {
    const input = {
      source_id: chart.source_id!,
      params: {
        ...chart.params,
        source_id: chart.source_id,
        workspace_id: this.workspaceId,
        layers: chart.params.layers.map((layer) => {
          return {
            ...layer,
            type: chart.type!,
          };
        }),
      } as ChartParams,
      type: chart.type!,
      name: chart.name ?? "",
    }
    return await updateOuterbaseDashboardChart(this.workspaceId, chartId, input);
  }
}

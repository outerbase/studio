import { ChartValue } from "@/components/chart/chart-type";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";

export abstract class BoardDriver {
  abstract onLayoutSave(
    boardId: string,
    value: OuterbaseAPIDashboardDetail
  ): Promise<unknown>;
  abstract onLayoutRemove(
    chartId: string,
    boardId: string,
    value: OuterbaseAPIDashboardDetail
  ): Promise<unknown>;
  abstract onAddChart(
    boardId: string,
    chart: ChartValue,
    value: OuterbaseAPIDashboardDetail
  ): Promise<ChartValue | undefined>;
}

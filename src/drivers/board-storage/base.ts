import { DashboardProps } from "@/components/board";
import { ChartValue } from "@/components/chart/chart-type";

export abstract class IBoardStorageDriver {
  abstract save(value: DashboardProps): Promise<unknown>;
  abstract remove(chartId: string): Promise<unknown>;
  abstract add(chart: ChartValue): Promise<ChartValue | undefined>;
  abstract update(
    chartId: string,
    chart: ChartValue
  ): Promise<ChartValue | undefined>;
}

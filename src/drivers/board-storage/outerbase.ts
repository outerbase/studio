import { DashboardProps } from "@/components/board";
import { ChartValue } from "@/components/chart/chart-type";
import { IBoardStorageDriver } from "./base";

export default class OuterbaseBoardStorageDriver
  implements IBoardStorageDriver
{
  constructor(
    protected workspaceId: string,
    protected boardId: string
  ) {}

  async save(value: DashboardProps): Promise<unknown> {
    // DO SOMETHING HERE
    throw new Error("Method not implemented.");
  }

  async remove(chartId: string): Promise<unknown> {
    // DO SOMETHING HERE
    throw new Error("Method not implemented.");
  }

  async add(chart: ChartValue): Promise<ChartValue> {
    // DO SOMETHING HERE
    throw new Error("Method not implemented.");
  }

  async update(chartId: string, chart: ChartValue): Promise<ChartValue> {
    // DO SOMETHING HERE
    throw new Error("Method not implemented.");
  }
}

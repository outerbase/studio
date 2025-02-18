import { DashboardProps } from "@/components/board";
import { ChartValue } from "@/components/chart/chart-type";
import { LocalDashboardData, localDb } from "@/indexdb";
import { IBoardStorageDriver } from "./base";

export default class LocalBoardStorage implements IBoardStorageDriver {
  constructor(protected board: LocalDashboardData) {}

  async add(chart: ChartValue): Promise<ChartValue | undefined> {
    const id = crypto.randomUUID();
    const now = Date.now();

    const data: ChartValue = {
      ...chart,
      id,
    };

    this.board.charts.push(data);
    this.board.updated_at = now;

    localDb.board.put({ id: this.board.id, content: this.board });
    return data;
  }

  async remove(chartId: string): Promise<void> {
    this.board.charts = this.board.charts.filter((v) => v.id !== chartId);
    localDb.board.put({ id: this.board.id, content: this.board });
  }

  async save(value: DashboardProps): Promise<void> {
    const now = Date.now();
    const newValue: LocalDashboardData = {
      ...this.board,
      ...value,
      updated_at: now,
    };

    localDb.board.put({ id: this.board.id, content: newValue });
  }

  async update(
    chartId: string,
    chart: ChartValue
  ): Promise<ChartValue | undefined> {
    const index = this.board.charts.findIndex((v) => v.id === chartId);
    if (index === -1) return Promise.resolve(undefined);

    this.board.charts[index] = chart;

    localDb.board.put({ id: this.board.id, content: this.board });
    return chart;
  }
}

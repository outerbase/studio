import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";

export abstract class BoardDriver {
  abstract onLayoutSave(boardId: string, value: OuterbaseAPIDashboardDetail): Promise<unknown>;
  abstract onLayoutRemove(chartId: string, boardId: string, value: OuterbaseAPIDashboardDetail): Promise<unknown>;
}
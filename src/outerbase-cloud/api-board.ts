import { ChartParams, ChartValue } from "@/components/chart/chart-type";
import { requestOuterbase } from "./api";

export async function createOuterbaseDashboardChart(
  workspaceId: string,
  options: {
    type: string;
    source_id: string;
    params: ChartParams;
    name: string;
  }
): Promise<ChartValue> {
  return requestOuterbase<ChartValue>(
    `/api/v1/workspace/${workspaceId}/chart`,
    "POST",
    options
  );
}

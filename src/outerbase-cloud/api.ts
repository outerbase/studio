import {
  OuterbaseAPIBaseResponse,
  OuterbaseAPIDashboardDetail,
  OuterbaseAPIDashboardListResponse,
  OuterbaseAPIQueryRaw,
  OuterbaseAPIResponse,
  OuterbaseAPIWorkspaceResponse,
} from "./api-type";

export async function requestOuterbase<T = unknown>(
  url: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: unknown
) {
  const raw = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": localStorage.getItem("ob-token") || "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await raw.json()) as OuterbaseAPIResponse<T>;
  return json.response;
}

export function getOuterbaseWorkspace() {
  return requestOuterbase<OuterbaseAPIWorkspaceResponse>("/api/v1/workspace");
}

export async function getOuterbaseBase(workspaceId: string, baseId: string) {
  const baseList = await requestOuterbase<OuterbaseAPIBaseResponse>(
    "/api/v1/workspace/" +
      workspaceId +
      "/connection?" +
      new URLSearchParams({ baseId })
  );

  return baseList.items[0];
}

export async function getOuterbaseDashboardList(workspaceId: string) {
  return requestOuterbase<OuterbaseAPIDashboardListResponse>(
    `/api/v1/workspace/${workspaceId}/dashboard`
  );
}

export async function getOuterbaseDashboard(
  workspaceId: string,
  dashboardId: string
) {
  return requestOuterbase<OuterbaseAPIDashboardDetail>(
    `/api/v1/workspace/${workspaceId}/dashboard/${dashboardId}`
  );
}

export async function runOuterbaseQueryRaw(
  workspaceId: string,
  sourceId: string,
  query: string
) {
  return requestOuterbase<OuterbaseAPIQueryRaw>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/query/raw`,
    "POST",
    { query }
  );
}

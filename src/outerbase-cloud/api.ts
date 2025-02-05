import {
  OuterbaseAPIBaseResponse,
  OuterbaseAPIDashboardChart,
  OuterbaseAPIDashboardDetail,
  OuterbaseAPIDashboardListResponse,
  OuterbaseAPIError,
  OuterbaseAPIQuery,
  OuterbaseAPIQueryListResponse,
  OuterbaseAPIQueryRaw,
  OuterbaseAPIResponse,
  OuterbaseAPISession,
  OuterbaseAPIUser,
  OuterbaseAPIWorkspaceResponse,
} from "./api-type";

export async function requestOuterbase<T = unknown>(
  url: string,
  method: "GET" | "POST" | "DELETE" | "PUT" = "GET",
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

  if (json.error) {
    throw new OuterbaseAPIError(json.error);
  }

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

export async function runOuterbaseQueryBatch(
  workspaceId: string,
  sourceId: string,
  queries: string[]
) {
  return requestOuterbase<OuterbaseAPIQueryRaw[]>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/query/batch`,
    "POST",
    { query: queries }
  );
}

export async function getOuterbaseQueryList(
  workspaceId: string,
  baseId: string
) {
  return requestOuterbase<OuterbaseAPIQueryListResponse>(
    `/api/v1/workspace/${workspaceId}/query?${new URLSearchParams({ baseId })}`
  );
}

export async function createOuterbaseQuery(
  workspaceId: string,
  baseId: string,
  options: { source_id: string; name: string; baseId: string; query: string }
) {
  return requestOuterbase<OuterbaseAPIQuery>(
    `/api/v1/workspace/${workspaceId}/query?${new URLSearchParams({ baseId })}`,
    "POST",
    options
  );
}

export async function deleteOuterbaseQuery(
  worksaceId: string,
  queryId: string
) {
  return requestOuterbase(
    `/api/v1/workspace/${worksaceId}/query/${queryId}`,
    "DELETE"
  );
}

export async function updateOuterbaseQuery(
  worksaceId: string,
  queryId: string,
  options: { name: string; query: string }
) {
  return requestOuterbase<OuterbaseAPIQuery>(
    `/api/v1/workspace/${worksaceId}/query/${queryId}`,
    "PUT",
    options
  );
}

export async function getOuterbaseSession() {
  return requestOuterbase<{
    session: OuterbaseAPISession;
    user: OuterbaseAPIUser;
  }>("/api/v1/auth/session");
}

export async function loginOuterbaseByPassword(
  email: string,
  password: string
) {
  return requestOuterbase<OuterbaseAPISession>("/api/v1/auth/login", "POST", {
    email,
    password,
  });
}

export async function getOuterbaseEmbedChart(
  chartId: string,
  apiKey: string
): Promise<OuterbaseAPIResponse<OuterbaseAPIDashboardChart>> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_OB_API}/chart/${chartId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chart-api-key": apiKey,
      },
    }
  );

  return await result.json();
}

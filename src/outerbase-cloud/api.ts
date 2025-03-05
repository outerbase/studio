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

export async function deleteOuterbaseBase(workspaceId: string, baseId: string) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/base/${baseId}`,
    "DELETE"
  );
}

export async function getOuterbaseDashboardList(workspaceId?: string) {
  return requestOuterbase<OuterbaseAPIDashboardListResponse>(
    workspaceId
      ? `/api/v1/workspace/${workspaceId}/dashboard`
      : "/api/v1/workspace/dashboard"
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

export async function createOuterbaseDashboard(
  workspaceId: string,
  baseId: string | undefined,
  name: string
) {
  return requestOuterbase<OuterbaseAPIDashboardDetail>(
    `/api/v1/workspace/${workspaceId}/dashboard` +
      (baseId ? `?baseId=${baseId}` : ""),
    "POST",
    {
      name,
      base_id: baseId ?? "",
      chart_ids: [],
      data: {
        version: 3,
        filters: [],
        isWorkspaceScoped: !baseId,
      },
      layout: [],
      directory_index: 0,
      type: "dashboard",
    }
  );
}

export async function deleteOuterbaseDashboard(
  workspaceId: string,
  dashboardId: string
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/dashboard/${dashboardId}`,
    "DELETE"
  );
}

export async function updateOuterbaseDashboard(
  workspaceId: string,
  dashboardId: string,
  data: any
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/dashboard/${dashboardId}`,
    "PUT",
    data
  );
}

export async function deleteOuterbaseDashboardChart(
  workspaceId: string,
  chartId: string
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/chart/${chartId}`,
    "DELETE"
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
  workspaceId: string,
  queryId: string
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/query/${queryId}`,
    "DELETE"
  );
}

export async function updateOuterbaseQuery(
  workspaceId: string,
  queryId: string,
  options: { name: string; query: string }
) {
  return requestOuterbase<OuterbaseAPIQuery>(
    `/api/v1/workspace/${workspaceId}/query/${queryId}`,
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

export async function registerOuterbaseByPassword(
  email: string,
  password: string
) {
  return requestOuterbase<OuterbaseAPISession>(
    "/api/v1/auth/register",
    "POST",
    {
      email,
      password,
    }
  );
}

export async function verifyOuterbaseRequestEmail() {
  return requestOuterbase("/api/v1/me/email/verify/request", "POST");
}

export async function verifyOuterbaseSubmitEmail(
  email_confirmation_token: string
) {
  return requestOuterbase<{ response: unknown; success: boolean }>(
    "/api/v1/me/email/verify/submit",
    "POST",
    {
      email_confirmation_token,
    }
  );
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

export async function sendOuterbaseBaseAnalytics(
  workspaceId: string,
  baseId: string
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/analytics`,
    "POST",
    {
      data: {
        path: "/[workspaceId]/[baseId]/settings/database",
      },
      type: "page_view",
    }
  );
}

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
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogResponse,
  OuterbaseDataCatalogSchemas,
  OuterbaseDataCatalogVirtualColumnInput,
  OuterbaseDefinitionInput,
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
      base_id: baseId ?? null,
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

export async function getOuterbaseSchemas(
  workspaceId: string,
  sourceId: string,
  baseId?: string
) {
  return await requestOuterbase<Record<string, OuterbaseDataCatalogSchemas[]>>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/schema?baseId=${baseId}`
  );
}

export async function getOuterbaseBaseComments(
  workspaceId: string,
  sourceId: string,
  baseId: string,
  size: number = 1000
) {
  return await requestOuterbase<
    OuterbaseDataCatalogResponse<OuterbaseDataCatalogComment[]>
  >(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment?size=${size}&baseId=${baseId}`
  );
}

export async function getOuterbaseDefinitions(
  workspaceId: string,
  baseId: string
) {
  return await requestOuterbase<
    OuterbaseDataCatalogResponse<OuterbaseDataCatalogDefinition[]>
  >(`/api/v1/workspace/${workspaceId}/base/${baseId}/definition`);
}

export async function updateOuerbaseDefinition(
  workspaceId: string,
  baseId: string,
  definitionId: string,
  data: OuterbaseDefinitionInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogDefinition>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition/${definitionId}`,
    "PUT",
    data
  );

  return result;
}
export async function createOuterbaseDefinition(
  workspaceId: string,
  baseId: string,
  data: OuterbaseDefinitionInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogDefinition>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition`,
    "POST",
    {
      base_id: baseId,
      ...data,
    }
  );

  return result;
}

export async function deleteOuterbaseDefinition(
  workspaceId: string,
  baseId: string,
  definitionId: string
) {
  const result = await requestOuterbase<OuterbaseAPIResponse>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition/${definitionId}`,
    "DELETE"
  );

  return result;
}

export async function updateOuterbaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  commentId: string,
  data: OuterbaseDataCatalogVirtualColumnInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogComment>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment/${commentId}`,
    "PUT",
    data
  );

  return result;
}

export async function createOuterbaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  data: OuterbaseDataCatalogVirtualColumnInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogComment>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment`,
    "POST",
    data
  );

  return result;
}

export async function deleteOutebaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  commentId: string
) {
  try {
    await requestOuterbase<boolean>(
      `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment/${commentId}`,
      "DELETE"
    );
    return true;
  } catch {
    return false;
  }
}

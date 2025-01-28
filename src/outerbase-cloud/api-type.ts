export interface OuterbaseDatabaseConfig {
  token: string;
  workspaceId: string;
  baseId: string;
  sourceId: string;
}

export interface OuterbaseAPIResponse<T = unknown> {
  success: boolean;
  response: T;
}

export interface OuterbaseAPIQueryRaw {
  items: Record<string, unknown>[];
}

export interface OuterbaseAPIAnalyticEvent {
  created_at: string;
}
export interface OuterbaseAPISource {
  model: "source";
  type: string;
  id: string;
}
export interface OuterbaseAPIBase {
  model: "base";
  short_name: string;
  access_short_name: string;
  name: string;
  id: string;
  sources: OuterbaseAPISource[];
  last_analytic_event: OuterbaseAPIAnalyticEvent;
}

export interface OuterbaseAPIWorkspace {
  model: "workspace";
  name: string;
  short_name: string;
  id: string;
  bases: OuterbaseAPIBase[];
}

export interface OuterbaseAPIDashboard {
  base_id: string | null;
  chart_ids: string[];
  created_at: string;
  id: string;
  model: "dashboard";
  type: "dashboard";
  name: string;
  workspace_id: string;
  layout: {
    h: number;
    i: string;
    w: number;
    x: number;
    y: number;
    max_h: number;
    max_w: number;
  }[];
}

export interface OuterbaseAPIQuery {
  base_id: string;
  id: string;
  name: string;
  query: string;
  source_id: string;
}
export interface OuterbaseAPIDashboardChart {
  connection_id: string | null;
  created_at: string;
  id: string;
  model: "chart";
  name: string;
  params: {
    id: string;
    name: string;
    type: string;
    model: string;
    apiKey: string;
    layers: {
      sql: string;
      type: string;
    }[];
    options: {
      xAxisKey: string;
    };
    source_id: string;
    created_at: string;
    updated_at: string;
    workspace_id: string;
    connection_id: string | null;
  };
  source_id: string;
  type: string;
  updated_at: string;
  workspace_id: string;
}

export interface OuterbaseAPIDashboardDetail extends OuterbaseAPIDashboard {
  charts: OuterbaseAPIDashboardChart[];
}

export interface OuterbaseAPIWorkspaceResponse {
  items: OuterbaseAPIWorkspace[];
}

export interface OuterbaseAPIBaseResponse {
  items: OuterbaseAPIBase[];
}

export interface OuterbaseAPIDashboardListResponse {
  items: OuterbaseAPIDashboard[];
}

export interface OuterbaseAPIQueryListResponse {
  items: OuterbaseAPIQuery[];
}

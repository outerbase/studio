import { ColumnHeader, ResultStat } from "@outerbase/sdk-transform";

export interface OuterbaseDatabaseConfig {
  workspaceId: string;
  sourceId: string;
  baseId: string;
  token: string;
}

export class OuterbaseAPIError extends Error {
  public readonly description: string;
  public readonly code: string;
  public readonly title: string;

  constructor(error: OuterbaseAPIErrorResponse) {
    super(error.description);

    this.description = error.description;
    this.code = error.code;
    this.message = error.description;
    this.title = error.title;
  }
}

export interface OuterbaseAPIErrorResponse {
  code: string;
  description: string;
  title: string;
}

export interface OuterbaseAPIResponse<T = unknown> {
  success: boolean;
  response: T;
  error?: OuterbaseAPIErrorResponse;
}

export interface OuterbaseAPIQueryRaw {
  items: Record<string, unknown>[];
  headers: ColumnHeader[];
  stat?: ResultStat;
  lastInsertRowid?: number;
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
  last_analytics_event: OuterbaseAPIAnalyticEvent;
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
  updated_at: string;
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
  result?: OuterbaseAPIQueryRaw;
  source_id: string;
  type: string;
  updated_at: string;
  workspace_id: string;
}

export interface OuterbaseAPISession {
  created_at: string;
  user_id: string;
  phone_verified_at: string | null;
  password_verified_at: string | null;
  otp_verified_at: string | null;
  oauth_verified_at: string | null;
  expires_at: string | null;
  token: string;
}

export interface OuterbaseAPIUser {
  avatar: string | null;
  google_user_id: string;
  initials: string;
  id: string;
  email: string;
  last_name: string;
  first_name: string;
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

export interface OuterbaseDataCatalogFlag {
  isActive: boolean;
  isVirtualKey: boolean;
}
export interface OuterbaseDataCatalogModelColumn {
  character_maximum_length: string;
  default: string;
  is_nullable: boolean;
  model: string;
  name: string;
  position: number;
  type: string;
}

export interface OuterbaseDataCatalogModelConstraint {
  column: string;
  model: string;
  name: string;
  table: string;
  type: string;
  columns: OuterbaseDataCatalogModelColumn[];
}

export interface OuterbaseDataCatalogSchemas {
  model: string;
  name: string;
  schema: string;
  type: string;
  columns: OuterbaseDataCatalogModelColumn[];
  constraints: OuterbaseDataCatalogModelConstraint[];
}

export interface OuterbaseDataCatalogComment {
  alias: string | null;
  body: string;
  column: string;
  created_at: string;
  flags: OuterbaseDataCatalogFlag;
  id: string;
  model: string;
  sample_data: string;
  schema: string;
  source_id: string;
  table: string;
  unit: string | null;
  updated_at: string;
  virtualKeyColumn: string;
  virtualKeySchema: string;
  virtualKeyTable: string;
}

export interface OuterbaseDataCatalogResponse<T = unknown> {
  items: T;
  count: number;
  order: { field: string; dir: string };
  pagination: { page: number; size: number; total: number };
}
export interface OuterbaseDataCatalogDefinition {
  connection_id: string | null;
  createdAt: string;
  created_at: string;
  created_user_id: string;
  definition: string;
  id: string;
  last_used_at: null;
  model: string;
  name: string;
  otherNames: string;
  updatedAt: string;
  updated_at: string;
  updated_by_user_id: string;
  workspace_id: string;
}

export interface OuterbaseDefinitionInput {
  name: string;
  definition: string;
  otherNames?: string;
}

export interface OuterbaseDataCatalogVirtualColumnInput {
  body: string;
  column: string;
  flags: OuterbaseDataCatalogFlag;
  sample_data: string;
  schema: string;
  table: string;
  virtual_key_column: string;
  virtual_key_schema: string;
  virtual_key_table: string;
}

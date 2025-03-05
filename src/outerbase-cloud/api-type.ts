import { DashboardProps } from "@/components/board";
import { ChartValue } from "@/components/chart/chart-type";
import { ColumnHeader, ResultStat } from "@outerbase/sdk-transform";

export interface OuterbaseDatabaseConfig {
  workspaceId: string;
  sourceId: string;
  baseId?: string;
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

export interface OuterbaseAPISourceInput {
  host?: string;
  user?: string;
  password?: string;
  port?: string;
  database?: string;
  type: string;
  ssl_config?: {
    require: boolean;
    rejectUnauthorized: boolean;
  };
  starbasedb_options?: { database_path: string; database_token: string };
  base_id: string;
  connection_id?: string;
}

export interface OuterbaseAPIBaseCredential extends OuterbaseAPISourceInput {
  id: string;
}

export interface OuterbaseAPISource {
  model: "source";
  type: string;
  id: string;
  base_id: string;
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

export interface OuterbaseAPIConnection {
  base_id: string;
  created_at: string;
  description: string;
  id: string;
  model: "connection";
  name: string;
  updated_at: string;
  workspace_id: string;
}

export interface OuterbaseAPIWorkspace {
  model: "workspace";
  name: string;
  short_name: string;
  id: string;
  bases: OuterbaseAPIBase[];
  is_enterprise: boolean;
  subscription: {
    status: "active" | "inactive";
    plan: "starter" | "growth";
  };
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
}

export interface OuterbaseAPIQuery {
  base_id: string;
  id: string;
  name: string;
  query: string;
  source_id: string;
}
export interface OuterbaseAPIDashboardChart extends ChartValue {
  result?: OuterbaseAPIQueryRaw;
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
  email_verified_at: string | null;
}

export interface OuterbaseAPIUser {
  avatar: string | null;
  google_user_id: string;
  initials: string;
  id: string;
  email: string;
  last_name: string;
  first_name: string;
  has_otp: boolean;
  has_password: boolean;
  has_verified_phone: boolean;
}

export interface OuterbaseAPIDashboardDetail
  extends OuterbaseAPIDashboard,
    DashboardProps {}

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
  alias?: string;
  body: string;
  column?: string;
  flags: OuterbaseDataCatalogFlag;
  sample_data: string;
  schema: string;
  table: string;
  unit?: string | null;
  virtual_key_column?: string;
  virtual_key_schema?: string;
  virtual_key_table?: string;
}

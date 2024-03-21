import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { DatabaseSchemaItem, DatabaseTableSchema } from "@/drivers/base-driver";
import { ResultSet } from "@libsql/client/web";

export interface ApiOpsBatchResponse {
  error?: string;
  data: ResultSet[];
}

export interface ApiOpsQueryResponse {
  error?: string;
  data: ResultSet;
}

export interface ApiDatabasesResponse {
  databases: SavedConnectionItem[];
}

export interface ApiDatabasesResponse {
  databases: SavedConnectionItem[];
}

export interface ApiSchemaListResponse {
  data: DatabaseSchemaItem[];
  error?: string;
}

export interface ApiSchemaResponse {
  data: DatabaseTableSchema;
  error?: string;
}

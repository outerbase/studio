import { SavedConnectionItem } from "@/app/(theme)/connect/saved-connection-storage";
import {
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseTableSchema,
  DatabaseTriggerSchema,
} from "@/drivers/base-driver";

export interface ApiOpsBatchResponse {
  error?: string;
  data: DatabaseResultSet[];
}

export interface ApiOpsQueryResponse {
  error?: string;
  data: DatabaseResultSet;
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

export interface ApiTriggerResponse {
  data: DatabaseTriggerSchema;
  error?: string;
}

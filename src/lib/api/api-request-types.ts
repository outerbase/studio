import {
  DatabaseTableOperation,
  SelectFromTableOptions,
} from "@/drivers/base-driver";

export interface RequestOperationBatch {
  type: "batch";
  statements: string[];
}

export interface RequestOperationQuery {
  type: "query";
  statement: string;
}

export interface RequestOperationSchemas {
  type: "schemas";
}

export interface RequestOperationSchema {
  type: "schema";
  tableName: string;
}

export interface RequestTriggerSchema {
  type: "trigger";
  name: string;
}

export interface RequestOperationTrigger {
  type: "trigger";
  name: string;
}

export interface RequestOperationSelectTable {
  type: "select-table";
  tableName: string;
  options: SelectFromTableOptions;
}

export interface RequestOperationFindFirst {
  type: "find-first";
  tableName: string;
  options: Record<string, unknown>;
}

export interface RequestOperationUpdateTableData {
  type: "update-table-data";
  tableName: string;
  ops: DatabaseTableOperation[];
}

export type RequestOperationBody =
  | RequestOperationBatch
  | RequestOperationQuery
  | RequestOperationSchemas
  | RequestOperationSelectTable
  | RequestOperationUpdateTableData
  | RequestOperationSchema
  | RequestOperationTrigger
  | RequestTriggerSchema
  | RequestOperationFindFirst;

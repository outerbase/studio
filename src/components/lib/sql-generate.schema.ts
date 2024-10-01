import deepEqual from "deep-equal";
import {
  DatabaseTableColumnChange,
  DatabaseTableSchema,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { cloneDeep } from "lodash";

export function checkSchemaColumnChange(change: DatabaseTableColumnChange) {
  return !deepEqual(change.old, change.new);
}

export function checkSchemaChange(change: DatabaseTableSchemaChange) {
  if (change.name.new !== change.name.old) return true;

  for (const col of change.columns) {
    if (checkSchemaColumnChange(col)) {
      return true;
    }
  }

  return false;
}

export function createTableSchemaDraft(
  schemaName: string,
  schema: DatabaseTableSchema
): DatabaseTableSchemaChange {
  return {
    schemaName,
    name: {
      old: schema.tableName,
      new: schema.tableName,
    },
    columns: schema.columns.map((col) => ({
      key: window.crypto.randomUUID(),
      old: col,
      new: cloneDeep(col),
    })),
    constraints: (schema.constraints ?? []).map((con) => ({
      id: window.crypto.randomUUID(),
      old: con,
      new: cloneDeep(con),
    })),
    createScript: schema.createScript,
  };
}

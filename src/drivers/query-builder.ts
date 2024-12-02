import { BaseDriver } from "./base-driver";

function generateWhere(dialect: BaseDriver, where: Record<string, unknown>) {
  const conditions = Object.entries(where)
    .map(([columnName, value]) => {
      return `${dialect.escapeId(columnName)} = ${dialect.escapeValue(value)}`;
    })
    .join(" AND ");

  if (conditions.length > 0) return "WHERE " + conditions;
  return null;
}

function generateSet(dialect: BaseDriver, where: Record<string, unknown>) {
  return Object.entries(where)
    .map(([columnName, value]) => {
      return `${dialect.escapeId(columnName)} = ${dialect.escapeValue(value)}`;
    })
    .join(", ");
}

function generateInsertValue(
  dialect: BaseDriver,
  values: Record<string, unknown>
) {
  const columnNameList: string[] = [];
  const valueList: string[] = [];

  for (const [columnName, value] of Object.entries(values)) {
    columnNameList.push(dialect.escapeId(columnName));
    valueList.push(dialect.escapeValue(value));
  }

  return `(${columnNameList.join(", ")}) VALUES(${valueList.join(", ")})`;
}

function generateLimit(limit?: number, offset?: number) {
  if (!Number.isInteger(limit)) return null;
  if (!Number.isInteger(offset)) return null;

  return `LIMIT ${limit} OFFSET ${offset}`;
}

export function selectFrom(
  dialect: BaseDriver,
  schema: string,
  table: string,
  where: Record<string, unknown>,
  options?: { limit?: number; offset?: number }
): string {
  return [
    "SELECT",
    "*",
    "FROM",
    `${dialect.escapeId(schema)}.${dialect.escapeId(table)}`,
    generateWhere(dialect, where),
    generateLimit(options?.limit, options?.offset),
  ]
    .filter(Boolean)
    .join(" ");
}

export function insertInto(
  dialect: BaseDriver,
  schema: string,
  table: string,
  value: Record<string, unknown>,
  supportReturning: boolean,
  supportRowId: boolean
) {
  return [
    "INSERT INTO",
    `${dialect.escapeId(schema)}.${dialect.escapeId(table)}`,
    generateInsertValue(dialect, value),
    supportReturning ? `RETURNING ${supportRowId ? "rowid, " : ""}*` : "",
  ].join(" ");
}

export function updateTable(
  dialect: BaseDriver,
  schema: string,
  table: string,
  value: Record<string, unknown>,
  where: Record<string, unknown>,
  supportReturning: boolean,
  supportRowId: boolean
): string {
  return [
    "UPDATE",
    `${dialect.escapeId(schema)}.${dialect.escapeId(table)}`,
    "SET",
    generateSet(dialect, value),
    generateWhere(dialect, where),
    supportReturning ? `RETURNING ${supportRowId ? "rowid, " : ""}*` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function deleteFrom(
  dialect: BaseDriver,
  schema: string,
  table: string,
  where: Record<string, unknown>
): string {
  return [
    "DELETE FROM",
    `${dialect.escapeId(schema)}.${dialect.escapeId(table)}`,
    generateWhere(dialect, where),
  ]
    .filter(Boolean)
    .join(" ");
}

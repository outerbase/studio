import { TableColumnDataType } from "@/drivers/base-driver";
import { hex } from "./bit-operation";
import { IdentifyResult } from "sql-query-identifier/lib/defines";

export function escapeIdentity(str: string) {
  return `"${str.replace(/"/g, `""`)}"`;
}

export function unescapeIdentity(str: string) {
  let r = str.replace(/^["`[]/g, "");
  r = r.replace(/["`\]]$/g, "");
  r = r.replace(/""/g, `"`);
  return r;
}

export function escapeSqlString(str: string) {
  return `'${str.replace(/'/g, `''`)}'`;
}

export function escapeSqlBinary(value: ArrayBuffer) {
  return `x'${hex(value)}'`;
}

export function escapeSqlValue(value: unknown) {
  if (value === undefined) return "DEFAULT";
  if (value === null) return "NULL";
  if (typeof value === "string") return escapeSqlString(value);
  if (typeof value === "number") return value.toString();
  if (typeof value === "bigint") return value.toString();
  if (value instanceof ArrayBuffer) return escapeSqlBinary(value);
  throw new Error(value + " is unrecongize type of value");
}

export function convertSqliteType(
  type: string | undefined
): TableColumnDataType {
  // https://www.sqlite.org/datatype3.html
  if (type === undefined) return TableColumnDataType.BLOB;

  type = type.toUpperCase();

  if (type.indexOf("CHAR") >= 0) return TableColumnDataType.TEXT;
  if (type.indexOf("TEXT") >= 0) return TableColumnDataType.TEXT;
  if (type.indexOf("CLOB") >= 0) return TableColumnDataType.TEXT;
  if (type.indexOf("STRING") >= 0) return TableColumnDataType.TEXT;

  if (type.indexOf("INT") >= 0) return TableColumnDataType.INTEGER;

  if (type.indexOf("BLOB") >= 0) return TableColumnDataType.BLOB;

  if (
    type.indexOf("REAL") >= 0 ||
    type.indexOf("DOUBLE") >= 0 ||
    type.indexOf("FLOAT") >= 0
  )
    return TableColumnDataType.REAL;

  return TableColumnDataType.TEXT;
}

export function generateSelectOneWithConditionStatement(
  tableName: string,
  condition: Record<string, unknown>
) {
  const wherePart = Object.entries(condition)
    .map(
      ([columnName, value]) =>
        `${escapeIdentity(columnName)} = ${escapeSqlValue(value)}`
    )
    .join(" AND ");

  return `SELECT * FROM ${escapeIdentity(
    tableName
  )} WHERE ${wherePart} LIMIT 1 OFFSET 0;`;
}

export function generateInsertStatement(
  tableName: string,
  value: Record<string, unknown>
): string {
  const fieldPart: string[] = [];
  const valuePart: unknown[] = [];

  for (const entry of Object.entries(value)) {
    fieldPart.push(entry[0]);
    valuePart.push(entry[1]);
  }
  return `INSERT INTO ${escapeIdentity(tableName)}(${fieldPart
    .map(escapeIdentity)
    .join(", ")}) VALUES(${valuePart.map(escapeSqlValue).join(", ")});`;
}

export function generateDeleteStatement(
  tableName: string,
  where: Record<string, unknown>
) {
  const wherePart: string = Object.entries(where)
    .map(
      ([columnName, value]) =>
        `${escapeIdentity(columnName)} = ${escapeSqlValue(value)}`
    )
    .join(" AND ");

  return `DELETE FROM ${escapeIdentity(tableName)} WHERE ${wherePart};`;
}

export function generateUpdateStatement(
  tableName: string,
  where: Record<string, unknown>,
  changeValue: Record<string, unknown>
): string {
  const setPart = Object.entries(changeValue)
    .map(([colName, value]) => {
      return `${escapeIdentity(colName)} = ${escapeSqlValue(value)}`;
    })
    .join(", ");

  const wherePart: string = Object.entries(where)
    .map(
      ([columnName, value]) =>
        `${escapeIdentity(columnName)} = ${escapeSqlValue(value)}`
    )
    .join(" AND ");

  return `UPDATE ${escapeIdentity(
    tableName
  )} SET ${setPart} WHERE ${wherePart};`;
}

export function selectStatementFromPosition(
  statements: IdentifyResult[],
  pos: number
): IdentifyResult | undefined {
  for (const statement of statements) {
    if (statement.end + 1 >= pos) return statement;
  }
  return undefined;
}

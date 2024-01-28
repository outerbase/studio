import { TableColumnDataType } from "@/app/(components)/OptimizeTable";

export function escapeIdentity(str: string) {
  return `"${str.replace(/"/g, `""`)}"`;
}

export function escapeSqlString(str: string) {
  return `'${str.replace(/'/g, `''`)}'`;
}

export function escapeSqlBinary(value: ArrayBuffer) {
  return "";
}

export function escapeSqlValue(value: unknown) {
  if (value === undefined) return "DEFAULT";
  if (value === null) return "NULL";
  if (typeof value === "string") return escapeSqlString(value);
  if (typeof value === "number") return value.toString();
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

  if (type.indexOf("INT") >= 0) return TableColumnDataType.INTEGER;

  if (type.indexOf("BLOB") >= 0) return TableColumnDataType.BLOB;

  if (type.indexOf("REAL") >= 0) return TableColumnDataType.REAL;

  return TableColumnDataType.BLOB;
}

export function generateUpdateStatementFromChange(
  tableName: string,
  whereColumnName: string[],
  original: Record<string, unknown>,
  changeValue: Record<string, unknown>
) {
  if (tableName === "") return null;
  if (whereColumnName.length === 0) return null;
  if (Object.keys(changeValue).length === 0) return null;

  for (const col of whereColumnName) {
    if (!(col in original)) return null;
  }

  const setPart = Object.entries(changeValue)
    .map(([colName, value]) => {
      return `${escapeIdentity(colName)} = ${escapeSqlValue(value)}`;
    })
    .join(", ");

  const wherePart: string[] = [];
  for (const col of whereColumnName) {
    wherePart.push(`${escapeIdentity(col)} = ${escapeSqlValue(original[col])}`);
  }

  return `UPDATE ${escapeIdentity(
    tableName
  )} SET ${setPart} WHERE ${wherePart.join(" AND ")}`;
}

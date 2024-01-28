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
): { sql?: string; error?: string } {
  let fieldPart: string[] = [];
  let valuePart: unknown[] = [];

  for (const entry of Object.entries(value)) {
    fieldPart.push(entry[0]);
    valuePart.push(entry[1]);
  }

  if (fieldPart.length === 0) {
    return { sql: `INSERT INTO ${escapeIdentity(tableName)}() VALUES();` };
  }

  return {
    sql: `INSERT INTO ${escapeIdentity(tableName)}(${fieldPart
      .map(escapeIdentity)
      .join(", ")}) VALUES(${valuePart.map(escapeSqlValue).join(", ")});`,
  };
}


export function generateUpdateStatementFromChange(
  tableName: string,
  whereColumnName: string[],
  original: Record<string, unknown>,
  changeValue: Record<string, unknown>
): { sql?: string; error?: string } {
  if (tableName === "") return { error: "Table name is not specified" };
  if (whereColumnName.length === 0)
    return { error: "There is no where column" };
  if (Object.keys(changeValue).length === 0)
    return { error: "There is no value to update" };

  for (const col of whereColumnName) {
    if (!(col in original))
      return {
        error: `${whereColumnName} does not exist inside original value`,
      };

    if (original[col] === null || original[col] === undefined) {
      return {
        error: `${whereColumnName} value is NULL or undefined. It is unsafe to UPDATE this row.`,
      };
    }

    if (changeValue[col] === null) {
      return {
        error: `${whereColumnName} is primary key. Set it to NULL is unsafe.`,
      };
    }
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

  return {
    sql: `UPDATE ${escapeIdentity(
      tableName
    )} SET ${setPart} WHERE ${wherePart.join(" AND ")}`,
  };
}

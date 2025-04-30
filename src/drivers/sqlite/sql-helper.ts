import { DatabaseValue } from "@/drivers/base-driver";
import { hex } from "@/lib/bit-operation";
import { parseUserInput } from "@/lib/export-helper";
import { ColumnType } from "@outerbase/sdk-transform";

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

export function escapeSqlValue(value: unknown, nullValue: string = "NULL") {
  if (value === undefined) return "DEFAULT";
  if (value === null) return parseUserInput(nullValue);
  if (typeof value === "string") return escapeSqlString(value);
  if (typeof value === "number") return value.toString();
  if (typeof value === "bigint") return value.toString();
  if (value instanceof ArrayBuffer) return escapeSqlBinary(value);
  if (Array.isArray(value))
    return escapeSqlBinary(Uint8Array.from(value).buffer);
  return "Invalid Value";
}

export function extractInputValue(input: string): string | number {
  const trimmedInput = input.trim();
  if (
    (trimmedInput.startsWith('"') && trimmedInput.endsWith('"')) ||
    (trimmedInput.startsWith("'") && trimmedInput.endsWith("'"))
  ) {
    return trimmedInput.slice(1, -1).toString();
  }

  const parsedNumber = parseFloat(trimmedInput);
  if (!isNaN(parsedNumber)) {
    return parsedNumber;
  }

  return trimmedInput.toString();
}

export function convertSqliteType(
  type: string | undefined
): ColumnType | undefined {
  // https://www.sqlite.org/datatype3.html
  if (type === "") return undefined;
  if (type === undefined) return ColumnType.BLOB;

  type = type.toUpperCase();

  if (type.includes("CHAR")) return ColumnType.TEXT;
  if (type.includes("TEXT")) return ColumnType.TEXT;
  if (type.includes("CLOB")) return ColumnType.TEXT;
  if (type.includes("STRING")) return ColumnType.TEXT;

  if (type.includes("INT")) return ColumnType.INTEGER;
  if (type.includes("NUMBER")) return ColumnType.INTEGER;

  if (type.includes("BLOB")) return ColumnType.BLOB;

  if (
    type.includes("REAL") ||
    type.includes("DOUBLE") ||
    type.includes("FLOAT")
  )
    return ColumnType.REAL;

  return ColumnType.TEXT;
}

export function escapeDelimitedValue(
  value: unknown,
  fieldSeparator: string,
  lineTerminator: string,
  encloser: string,
  nullValue: string = "NULL"
): string {
  if (value === null || value === undefined) {
    return nullValue;
  }

  const stringValue = value.toString();
  const needsEscaping =
    stringValue.includes(fieldSeparator) ||
    stringValue.includes(lineTerminator) ||
    stringValue.includes(encloser);

  if (needsEscaping) {
    return `${encloser}${stringValue.replace(new RegExp(encloser, "g"), encloser + encloser)}${encloser}`;
  }

  return stringValue;
}

export function convertDatabaseValueToString(value: DatabaseValue) {
  if (value === null) return "NULL";

  if (typeof value === "string") return value;

  if (typeof value === "bigint" || typeof value === "number") {
    return value.toString();
  }

  if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
    return btoa(
      new Uint8Array(value).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
  }

  return "";
}

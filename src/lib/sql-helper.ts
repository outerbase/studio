export function escapeIdentity(str: string) {
  return `'${str.replace(/"/g, `""`)}"`;
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

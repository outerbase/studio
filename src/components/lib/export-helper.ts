import {
  escapeCsvValue,
  escapeIdentity,
  escapeSqlValue,
} from "@/drivers/sqlite/sql-helper";

export function selectArrayFromIndexList<T = unknown>(
  data: T[],
  indexList: number[]
): T[] {
  return indexList.map((index) => data[index]) as T[];
}

export function exportRowsToSqlInsert(
  tableName: string,
  headers: string[],
  records: unknown[][]
): string {
  const result: string[] = [];

  const headersPart = headers.map(escapeIdentity).join(", ");

  for (const record of records) {
    const valuePart = record.map(escapeSqlValue).join(", ");
    const line = `INSERT INTO ${escapeIdentity(
      tableName
    )}(${headersPart}) VALUES(${valuePart});`;

    result.push(line);
  }

  return result.join("\r\n");
}

function cellToExcelValue(value: unknown) {
  if (value === undefined) return "";
  if (value === null) return "NULL";
  const parsed = Number(value);
  return isNaN(parsed) ? value : parsed;
}

export function exportRowsToExcel(records: unknown[][]) {
  const result: string[] = [];

  for (const record of records) {
    const line = record.map(cellToExcelValue).join("\t");
    result.push(line);
  }

  return result.join("\r\n");
}

export function exportToExcel(
  records: unknown[][],
  headers: string[],
  tablename: string
) {
  const processedData = records.map((row) =>
    row.map((cell) => {
      return cellToExcelValue(cell);
    })
  );

  const data = [headers, ...processedData];
  console.log(data);

  import("xlsx").then((module) => {
    const XLSX = module;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(workbook, `${tablename}.xlsx`);
  });

  return "";
}

export function exportRowsToJson(
  headers: string[],
  records: unknown[][]
): string {
  const recordsWithBigIntAsString = records.map((record) =>
    record.map((value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const recordsAsObjects = recordsWithBigIntAsString.map((record) =>
    record.reduce<Record<string, unknown>>((obj, value, index) => {
      const header = headers[index];
      if (header !== undefined) {
        obj[header] = value;
      }
      return obj;
    }, {})
  );

  return JSON.stringify(recordsAsObjects, null, 2);
}

export function exportRowsToCsv(
  headers: string[],
  records: unknown[][]
): string {
  const result: string[] = [];

  // Add headers
  const escapedHeaders = headers.map(escapeCsvValue);
  const headerLine = escapedHeaders.join(",");
  result.push(headerLine);

  // Add records
  for (const record of records) {
    const escapedRecord = record.map(escapeCsvValue);
    const recordLine = escapedRecord.join(",");
    result.push(recordLine);
  }

  return result.join("\n");
}

export function getFormatHandlers(
  records: unknown[][],
  headers: string[],
  tableName: string
): Record<string, (() => string) | undefined> {
  return {
    csv: () => exportRowsToCsv(headers, records),
    json: () => exportRowsToJson(headers, records),
    sql: () => exportRowsToSqlInsert(tableName, headers, records),
    xlsx: () => exportToExcel(records, headers, tableName),
  };
}

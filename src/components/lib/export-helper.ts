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
  return value.toString();
}

export function exportRowsToExcel(records: unknown[][]) {
  const result: string[] = [];

  for (const record of records) {
    const line = record.map(cellToExcelValue).join("\t");
    result.push(line);
  }

  return result.join("\r\n");
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

export function exportRowsToMarkdown(
  headers: string[],
  records: unknown[][],
  cellTextLimit: number
): string {
  const result: string[] = [];

  // Helper function to truncate text
  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit - 3) + "...";
  };

  // Helper function to wrap text
  const wrapText = (text: string, width: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length > width) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += word + " ";
    });
    if (currentLine.trim()) lines.push(currentLine.trim());
    return lines;
  };

  // Calculate column widths
  const columnWidths = headers.map((header, index) => {
    const maxContentWidth = Math.max(
      header.length,
      ...records.map((record) => String(record[index]).length)
    );
    return Math.min(maxContentWidth, cellTextLimit);
  });

  // Add headers
  const headerRow = `| ${headers.map((h, i) => truncateText(h.padEnd(columnWidths[i]), columnWidths[i])).join(" | ")} |`;
  result.push(headerRow);

  // Add separator
  const separator = `| ${columnWidths.map((width) => "-".repeat(width)).join(" | ")} |`;
  result.push(separator);

  // Add records
  for (const record of records) {
    const wrappedCells = record.map((cell, index) =>
      wrapText(truncateText(String(cell), cellTextLimit), columnWidths[index])
    );
    const maxLines = Math.max(...wrappedCells.map((cell) => cell.length));

    for (let i = 0; i < maxLines; i++) {
      const row = `| ${wrappedCells
        .map((cell, index) => (cell[i] || "").padEnd(columnWidths[index]))
        .join(" | ")} |`;
      result.push(row);
    }
  }

  return result.join("\n");
}

export function getFormatHandlers(
  records: unknown[][],
  headers: string[],
  tableName: string,
  cellTextLimit: number = 50
): Record<string, (() => string) | undefined> {
  return {
    csv: () => exportRowsToCsv(headers, records),
    json: () => exportRowsToJson(headers, records),
    sql: () => exportRowsToSqlInsert(tableName, headers, records),
    markdown: () => exportRowsToMarkdown(headers, records, cellTextLimit),
  };
}

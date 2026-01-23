import {
  ExportFormat,
  ExportOptions,
  ExportSelection,
  ExportTarget,
} from "@/components/gui/export/export-result-button";
import {
  escapeDelimitedValue,
  escapeIdentity,
  escapeSqlValue,
} from "@/drivers/sqlite/sql-helper";

export async function exportTableData(
  databaseDriver: any,
  schemaName: string,
  tableName: string,
  format: ExportFormat,
  exportTarget: ExportTarget,
  options?: ExportOptions
): Promise<string | Blob> {
  const limit = 2000;
  let offset = 0;
  let hasMore = true;
  let headers: string[] = [];
  let allProcessedRows: string[] = [];

  // 1. Get headers from first row
  const firstChunk = await databaseDriver.query(
    `SELECT * FROM ${databaseDriver.escapeId(schemaName)}.${databaseDriver.escapeId(tableName)} LIMIT 1 OFFSET 0`
  );
  
  if (!firstChunk.rows || firstChunk.rows.length === 0) return "";
  headers = Object.keys(firstChunk.rows[0]);

  // Add headers to CSV if needed
  if (format === "csv" || format === "delimited") {
     const sep = options?.fieldSeparator || ",";
     allProcessedRows.push(headers.map(h => escapeDelimitedValue(h, sep)).join(sep));
  }

  // 2. Paginated Loop
  while (hasMore) {
    const result = await databaseDriver.query(
      `SELECT * FROM ${databaseDriver.escapeId(schemaName)}.${databaseDriver.escapeId(tableName)} LIMIT ${limit} OFFSET ${offset}`
    );

    if (!result.rows || result.rows.length === 0) {
      hasMore = false;
      break;
    }

    const records = result.rows.map((row: any) =>
      headers.map((header) => row[header])
    );

    let chunkContent = "";
    if (format === "csv" || format === "delimited") {
      const sep = options?.fieldSeparator || ",";
      const term = options?.lineTerminator || "\n";
      chunkContent = records.map((row: any) => 
        row.map((cell: any) => escapeDelimitedValue(cell, sep)).join(sep)
      ).join(term);
    } else if (format === "sql") {
      chunkContent = records.map((record: any) => {
        const valuePart = record.map((v: any) => escapeSqlValue(v)).join(", ");
        return `INSERT INTO ${escapeIdentity(tableName)} (${headers.map(escapeIdentity).join(", ")}) VALUES (${valuePart});`;
      }).join("\n");
    } else {
      chunkContent = JSON.stringify(result.rows).slice(1, -1);
    }

    allProcessedRows.push(chunkContent);
    
    if (result.rows.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allProcessedRows.join(options?.lineTerminator || "\n");
}

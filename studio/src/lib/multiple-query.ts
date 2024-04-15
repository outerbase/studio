import { BaseDriver, DatabaseResultSet } from "@studio/drivers/base-driver";

export interface MultipleQueryProgressItem {
  order: number;
  sql: string;
  start: number;
  end?: number;
  affectedRow?: number;
  error?: string;
}

export interface MultipleQueryProgress {
  logs: MultipleQueryProgressItem[];
  progress: number;
  total: number;
  error?: boolean;
}

export async function multipleQuery(
  driver: BaseDriver,
  statements: string[],
  onProgress?: (progress: MultipleQueryProgress) => void
) {
  const logs: MultipleQueryProgressItem[] = [];
  const result: DatabaseResultSet[] = [];
  let lastResult: DatabaseResultSet | undefined;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    const log: MultipleQueryProgressItem = {
      order: i,
      sql: statement,
      start: Date.now(),
    };

    logs.push(log);
    if (onProgress) {
      onProgress({ logs, progress: i, total: statements.length });
    }

    try {
      const r = await driver.query(statement);

      log.end = Date.now();
      log.affectedRow = r.rowsAffected;

      if (r.headers.length > 0) {
        lastResult = r;
        result.push(r);
      }

      if (onProgress) {
        onProgress({ logs, progress: i + 1, total: statements.length });
      }
    } catch (e) {
      log.end = Date.now();
      log.error = (e as Error).toString();

      if (onProgress) {
        onProgress({
          logs,
          progress: i,
          total: statements.length,
          error: true,
        });
      }

      break;
    }
  }

  return {
    result,
    last: lastResult,
  };
}

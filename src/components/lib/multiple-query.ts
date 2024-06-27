import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseResultStat,
} from "@/drivers/base-driver";

export interface MultipleQueryProgressItem {
  order: number;
  sql: string;
  start: number;
  end?: number;
  stats?: DatabaseResultStat;
  error?: string;
}

export interface MultipleQueryProgress {
  logs: MultipleQueryProgressItem[];
  progress: number;
  total: number;
  error?: boolean;
}

export interface MultipleQueryResult {
  result: DatabaseResultSet;
  sql: string;
  order: number;
}

export async function multipleQuery(
  driver: BaseDriver,
  statements: string[],
  onProgress?: (progress: MultipleQueryProgress) => void
): Promise<MultipleQueryResult[]> {
  const logs: MultipleQueryProgressItem[] = [];
  const result: MultipleQueryResult[] = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] as string;

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
      log.stats = r.stat;

      if (r.headers.length > 0) {
        result.push({
          sql: statement,
          order: i,
          result: r,
        });
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

  return result;
}

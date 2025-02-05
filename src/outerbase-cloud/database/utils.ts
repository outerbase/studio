import { DatabaseResultSet } from "@/drivers/base-driver";
import { OuterbaseAPIQueryRaw, OuterbaseDatabaseConfig } from "../api-type";
import { OuterbaseMySQLDriver } from "./mysql";
import { OuterbasePostgresDriver } from "./postgresql";
import { OuterbaseSqliteDriver } from "./sqlite";

export function transformOuterbaseResult(
  result: OuterbaseAPIQueryRaw
): DatabaseResultSet {
  return {
    rows: result.items,
    headers: result.headers,
    stat: result.stat ?? {
      rowsAffected: 0,
      rowsRead: null,
      rowsWritten: null,
      queryDurationMs: null,
    },
    lastInsertRowid: result.lastInsertRowid,
  };
}

export function createOuterbaseDatabaseDriver(
  type: string,
  config: OuterbaseDatabaseConfig
) {
  if (type === "postgres") {
    return new OuterbasePostgresDriver(config);
  } else if (type === "mysql") {
    return new OuterbaseMySQLDriver(config);
  }

  return new OuterbaseSqliteDriver(config);
}

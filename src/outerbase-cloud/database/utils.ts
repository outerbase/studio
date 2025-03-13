import { DatabaseResultSet } from "@/drivers/base-driver";
import MySQLLikeDriver from "@/drivers/mysql/mysql-driver";
import PostgresLikeDriver from "@/drivers/postgres/postgres-driver";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
import { OuterbaseAPIQueryRaw, OuterbaseDatabaseConfig } from "../api-type";
import { OuterbaseQueryable } from "./query";

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
  const queryable = new OuterbaseQueryable(config);

  if (type === "postgres") {
    return new PostgresLikeDriver(queryable);
  } else if (type === "mysql") {
    return new MySQLLikeDriver(queryable);
  }

  return new SqliteLikeBaseDriver(queryable);
}

import { OuterbaseDatabaseConfig } from "../api-type";
import { OuterbaseMySQLDriver } from "./mysql";
import { OuterbasePostgresDriver } from "./postgresql";
import { OuterbaseSqliteDriver } from "./sqlite";

export function createOuterbaseDatabaseDriver(type: string, config: OuterbaseDatabaseConfig) {
  if (type === "postgres") {
    return new OuterbasePostgresDriver(config)
  } else if (type === 'mysql') {
    return new OuterbaseMySQLDriver(config);
  }

  return new OuterbaseSqliteDriver(config);
}
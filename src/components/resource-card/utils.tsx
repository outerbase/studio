import { ChartBar, Database } from "@phosphor-icons/react";
import {
  MySQLIcon,
  PostgreIcon,
  RqliteIcon,
  SQLiteIcon,
  TursoIcon,
} from "../icons/outerbase-icon";
import { CloudflareIcon, StarbaseIcon, ValTownIcon } from "./icon";
import {
  BoardVisual,
  GeneralVisual,
  MySQLVisual,
  SQLiteVisual,
} from "./visual";

export function getDatabaseFriendlyName(type: string) {
  if (type === "sqlite") return "SQLite";
  if (type === "sqlite-filehandler") return "SQLite";
  if (type === "mysql") return "MySQL";
  if (type === "postgres") return "PostgreSQL";
  if (type === "rqlite") return "rqlite";
  if (type === "turso") return "Turso";
  if (type === "libsql") return "LibSQL";
  if (type === "mssql") return "Microsoft SQL";
  if (type === "snowflake") return "Snowflake";
  if (type === "motherduck") return "Motherduck";
  if (type === "duckdb") return "DuckDB";
  if (type === "cloudflare" || type === "cloudflare-d1") return "Cloudflare";
  if (type === "cloudflare-wae") return "Worker Analytics Engine";
  if (type === "starbasedb") return "StarbaseDB";
  if (type === "starbase") return "StarbaseDB";
  if (type === "bigquery") return "BigQuery";
  if (type === "valtown") return "ValTown";
  if (type === "board") return "Board";

  return type;
}

export function getDatabaseIcon(type: string) {
  if (type === "mysql") return MySQLIcon;
  if (type === "postgres") return PostgreIcon;
  if (
    type === "cloudflare" ||
    type === "cloudflare-d1" ||
    type === "cloudflare-wae"
  )
    return CloudflareIcon;
  if (type === "valtown") return ValTownIcon;
  if (type === "starbasedb" || type === "starbase") return StarbaseIcon;
  if (type === "libsql" || type === "turso") return TursoIcon;
  if (type === "rqlite") return RqliteIcon;
  if (type === "sqlite") return SQLiteIcon;
  if (type === "board") return ChartBar;

  return Database;
}

export function getDatabaseVisual(type: string) {
  if (type === "mysql") return MySQLVisual;
  if (type === "sqlite") return SQLiteVisual;
  if (type === "postgres") return GeneralVisual;
  if (type === "board") return BoardVisual;

  return GeneralVisual;
}

export function getDatabaseColor(type: string) {
  if (type === "cloudflare" || type === "cloudflare-d1") return "yellow";
  if (type === "starbasedb" || type === "starbase") return "rainbow";
  if (type === "libsql" || type === "turso") return "green";
  return "default";
}

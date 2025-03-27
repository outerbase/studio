import {
  MySQLIcon,
  PostgreIcon,
  SQLiteIcon,
} from "@/components/icons/outerbase-icon";
import {
  CloudflareIcon,
  RQLiteIcon,
  StarbaseIcon,
  TursoIcon,
  ValTownIcon,
} from "@/components/resource-card/icon";
import { NewResourceType } from "./new-resource-button";

export function getCreateResourceTypeList(
  workspaceId?: string
): NewResourceType[] {
  return [
    {
      name: "Cloudflare D1",
      icon: CloudflareIcon,
      href: workspaceId ? "" : "/local/new-base/cloudflare-d1",
      colorClassName: "text-orange-500",
      cloudflare: true,
    },
    {
      name: "Durable Object",
      icon: CloudflareIcon,
      href: workspaceId ? "" : "/local/new-base/durable-object",
      colorClassName: "text-orange-500",
      cloudflare: true,
    },
    {
      name: "Worker Analytics Engine",
      icon: CloudflareIcon,
      colorClassName: "text-orange-500",
      href: workspaceId ? "" : "/local/new-base/cloudflare-wae",
      cloudflare: true,
    },
    {
      name: "StarbaseDB",
      icon: StarbaseIcon,
      href: workspaceId
        ? `/w/${workspaceId}/new-base/starbasedb`
        : "/local/new-base/starbase",
    },
    {
      name: "Turso/LibSQL",
      icon: TursoIcon,
      href: workspaceId ? "" : "/local/new-base/turso",
    },
    {
      name: "Postgres",
      icon: PostgreIcon,
      href: workspaceId
        ? `/w/${workspaceId}/new-base/postgres`
        : "/local/new-base/postgres",
    },
    {
      name: "MySQL",
      icon: MySQLIcon,
      href: workspaceId
        ? `/w/${workspaceId}/new-base/mysql`
        : "/local/new-base/mysql",
    },
    {
      name: "SQLite",
      icon: SQLiteIcon,
      href: workspaceId ? "" : "/local/new-base/sqlite-filehandler",
    },
    {
      name: "val.town",
      icon: ValTownIcon,
      href: workspaceId ? "" : "/local/new-base/valtown",
    },
    {
      name: "rqlite",
      icon: RQLiteIcon,
      href: workspaceId ? "" : "/local/new-base/rqlite",
    },
  ].filter((resource) => resource.href);
}

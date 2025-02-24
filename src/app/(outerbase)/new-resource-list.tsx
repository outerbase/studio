import {
  MySQLIcon,
  PostgreIcon,
  SQLiteIcon,
} from "@/components/icons/outerbase-icon";
import {
  CloudflareIcon,
  DigitalOceanIcon,
  NeonIcon,
  StarbaseIcon,
  SupabaseIcon,
  TursoIcon,
} from "@/components/resource-card/icon";
import { NewResourceType } from "./new-resource-button";

export function getCreateResourceTypeList(
  workspaceId?: string
): NewResourceType[] {
  return [
    {
      name: "Supabase",
      icon: SupabaseIcon,
      href: workspaceId ? "" : "",
      comingSoon: true,
      thirdParty: true,
    },
    {
      name: "Cloudflare",
      icon: CloudflareIcon,
      href: workspaceId ? "" : "",
      thirdParty: true,
      comingSoon: true,
    },
    {
      name: "Cloudflare (Manual)",
      icon: CloudflareIcon,
      href: workspaceId ? "" : "/local/new-base/cloudflare-d1",
    },
    {
      name: "Neon",
      icon: NeonIcon,
      href: workspaceId ? "" : "",
      comingSoon: true,
      thirdParty: true,
    },
    {
      name: "StarbaseDB",
      icon: StarbaseIcon,
      href: workspaceId
        ? `/w/${workspaceId}/new-base/starbasedb`
        : "/local/new-base/starbase",
    },
    {
      name: "Turso/LibSQL (Manual)",
      icon: TursoIcon,
      href: workspaceId ? "" : "/local/new-base/turso",
    },
    {
      name: "Turso",
      icon: TursoIcon,
      thirdParty: true,
      comingSoon: true,
      href: workspaceId
        ? `/w/${workspaceId}/new-base/turso`
        : "/local/new-base/turso",
    },
    {
      name: "DigitalOcean",
      icon: DigitalOceanIcon,
      comingSoon: true,
      href: workspaceId ? "" : "",
      thirdParty: true,
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
  ].filter((resource) => resource.href || resource.comingSoon);
}

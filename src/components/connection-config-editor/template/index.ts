import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { CloudflareConnectionTemplate } from "./cloudflare";
import { CloudflareWAEConnectionTemplate } from "./cloudflare-wae";
import { MySQLConnectionTemplate } from "./mysql";
import { PostgresConnectionTemplate } from "./postgres";
import { RqliteConnectionTemplate } from "./rqlite";
import { SqliteConnectionTemplate } from "./sqlite";
import { StarbaseConnectionTemplate } from "./starbase";
import { TursoConnectionTemplate } from "./turso";
import { ValtownConnectionTemplate } from "./valtown";

export const ConnectionTemplateDictionary: Record<
  string,
  ConnectionTemplateList
> = {
  "cloudflare-wae": CloudflareWAEConnectionTemplate,
  "cloudflare-d1": CloudflareConnectionTemplate,
  rqlite: RqliteConnectionTemplate,
  "sqlite-filehandler": SqliteConnectionTemplate,
  turso: TursoConnectionTemplate,
  valtown: ValtownConnectionTemplate,

  starbase: StarbaseConnectionTemplate,
  starbasedb: StarbaseConnectionTemplate,

  mysql: MySQLConnectionTemplate,
  postgres: PostgresConnectionTemplate,
};

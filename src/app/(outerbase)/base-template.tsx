import {
  CommonConnectionConfig,
  CommonConnectionConfigTemplate,
} from "@/components/connection-config-editor";
import { CLOUDFLARE_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/cloudflare";
import { GENERIC_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/generic";
import { RQLITE_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/rqlite";
import { SQLITE_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/sqlite";
import { TURSO_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/turso";
import { OuterbaseAPISourceInput } from "@/outerbase-cloud/api-type";
import { SavedConnectionItemConfig } from "../(theme)/connect/saved-connection-storage";

export interface ConnectionTemplateList<T = any> {
  template: CommonConnectionConfigTemplate;
  from: (value: T) => CommonConnectionConfig;
  to: (value: CommonConnectionConfig) => T;
}

export const LOCAL_CONNECTION_TEMPLATES: Record<
  string,
  ConnectionTemplateList<SavedConnectionItemConfig>
> = {
  "cloudflare-d1": {
    template: CLOUDFLARE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        database: value.config.database,
        token: value.config.token,
        username: value.config.username,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "cloudflare-d1",
        config: {
          database: value.database,
          token: value.token,
          username: value.username,
        },
      };
    },
  },
  turso: {
    template: TURSO_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.config.url,
        token: value.config.token,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "turso",
        config: {
          url: value.host,
          token: value.token,
        },
      };
    },
  },
  starbase: {
    template: TURSO_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.config.url,
        token: value.config.token,
      };
    },
    to: (value) => {
      return {
        driver: "starbase",
        name: value.name,
        config: {
          url: value.host,
          token: value.token,
        },
      };
    },
  },
  rqlite: {
    template: RQLITE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.config.url,
        username: value.config.username,
        password: value.config.password,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "rqlite",
        config: {
          url: value.host,
          username: value.username,
          password: value.password,
        },
      };
    },
  },
  "sqlite-filehandler": {
    template: SQLITE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        filehandler: value.config.filehandler,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "sqlite-filehandler",
        config: {
          filehandler: value.filehandler,
        },
      };
    },
  },
};

export const REMOTE_CONNECTION_TEMPLATES: Record<
  string,
  ConnectionTemplateList<{ source: OuterbaseAPISourceInput; name: string }>
> = {
  mysql: {
    template: GENERIC_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.source.host,
        username: value.source.user,
        database: value.source.database,
        port: value.source.port,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        source: {
          host: value.host,
          user: value.username,
          password: value.password,
          database: value.database,
          port: value.port,
          type: "mysql",
          base_id: "",
        },
      };
    },
  },
  postgres: {
    template: GENERIC_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.source.host,
        username: value.source.user,
        database: value.source.database,
        port: value.source.port,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        source: {
          host: value.host,
          user: value.username,
          password: value.password,
          database: value.database,
          port: value.port,
          type: "postgres",
          base_id: "",
        },
      };
    },
  },

  starbasedb: {
    template: TURSO_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.source.host,
        username: value.source.user,
        database: value.source.database,
        port: value.source.port,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        source: {
          host: value.host,
          user: value.username,
          password: value.password,
          database: value.database,
          port: value.port,
          type: "starbasedb",
          base_id: "",
        },
      };
    },
  },
};

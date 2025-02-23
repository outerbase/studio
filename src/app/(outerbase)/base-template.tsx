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
import { SavedConnectionRawLocalStorage } from "../(theme)/connect/saved-connection-storage";

export interface ConnectionTemplateList<T = any> {
  template: CommonConnectionConfigTemplate;
  from: (value: T) => CommonConnectionConfig;
  to: (value: CommonConnectionConfig) => T;
}

export const LOCAL_CONNECTION_TEMPLATES: Record<
  string,
  ConnectionTemplateList<SavedConnectionRawLocalStorage>
> = {
  "cloudflare-d1": {
    template: CLOUDFLARE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        database: value.database,
        token: value.token,
        username: value.username,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "cloudflare-d1",
        database: value.database,
        token: value.token,
        username: value.username,
      };
    },
  },
  turso: {
    template: TURSO_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.url,
        token: value.token,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "turso",
        url: value.host,
        token: value.token,
      };
    },
  },
  starbase: {
    template: TURSO_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.url,
        token: value.token,
      };
    },
    to: (value) => {
      return {
        driver: "starbase",
        name: value.name,
        url: value.host,
        token: value.token,
      };
    },
  },
  rqlite: {
    template: RQLITE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        host: value.url,
        username: value.username,
        password: value.password,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "rqlite",
        url: value.host,
        username: value.username,
        password: value.password,
      };
    },
  },
  "sqlite-filehandler": {
    template: SQLITE_CONNECTION_TEMPLATE,
    from: (value) => {
      return {
        name: value.name,
        filehandler: value.file_handler,
      };
    },
    to: (value) => {
      return {
        name: value.name,
        driver: "sqlite-filehandler",
        filehandler: value.filehandler,
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

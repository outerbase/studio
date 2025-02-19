import {
  CommonConnectionConfig,
  CommonConnectionConfigTemplate,
} from "@/components/connection-config-editor";
import { CLOUDFLARE_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/cloudflare";
import { RQLITE_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/rqlite";
import { TURSO_CONNECTION_TEMPLATE } from "@/components/connection-config-editor/template/turso";
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
    from: (value: SavedConnectionItemConfig): CommonConnectionConfig => {
      return {
        name: value.name,
        database: value.config.database,
        token: value.config.token,
        username: value.config.username,
      };
    },
    to: (value: CommonConnectionConfig): SavedConnectionItemConfig => {
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
    from: (value: SavedConnectionItemConfig): CommonConnectionConfig => {
      return {
        name: value.name,
        host: value.config.url,
        token: value.config.token,
      };
    },
    to: (value: CommonConnectionConfig): SavedConnectionItemConfig => {
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
    from: (value: SavedConnectionItemConfig): CommonConnectionConfig => {
      return {
        name: value.name,
        host: value.config.url,
        token: value.config.token,
      };
    },
    to: (value: CommonConnectionConfig): SavedConnectionItemConfig => {
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
    from: (value: SavedConnectionItemConfig): CommonConnectionConfig => {
      return {
        name: value.name,
        host: value.config.url,
        username: value.config.username,
        password: value.config.password,
      };
    },
    to: (value: CommonConnectionConfig): SavedConnectionItemConfig => {
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
};

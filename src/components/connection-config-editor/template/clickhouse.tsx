import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { GENERIC_CONNECTION_TEMPLATE } from "./generic";

function buildClickHouseUrl(
  host?: string,
  port?: string,
  ssl?: boolean | string
): string {
  const useSsl = ssl === true || ssl === "true";
  const protocol = useSsl ? "https" : "http";
  const defaultPort = useSsl ? "8443" : "8123";
  const actualHost = (host ?? "localhost").replace(/^https?:\/\//, "");
  const actualPort = port && port.length > 0 ? port : defaultPort;
  return `${protocol}://${actualHost}:${actualPort}`;
}

function parseClickHouseUrl(url: string | undefined): {
  host: string;
  port: string;
  ssl: boolean;
} {
  if (!url) return { host: "", port: "8123", ssl: false };
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? "8443" : "8123"),
      ssl: parsed.protocol === "https:",
    };
  } catch {
    return { host: url, port: "8123", ssl: false };
  }
}

export const ClickHouseConnectionTemplate: ConnectionTemplateList = {
  template: GENERIC_CONNECTION_TEMPLATE,
  remoteFrom: (value) => {
    return {
      name: value.name,
      host: value.source.host,
      username: value.source.user,
      database: value.source.database,
      port: value.source.port,
    };
  },
  remoteTo: (value) => {
    return {
      name: value.name,
      source: {
        host: value.host,
        user: value.username,
        password: value.password,
        database: value.database,
        port: value.port,
        type: "clickhouse",
        base_id: "",
      },
    };
  },
  localFrom: (value) => {
    const parsed = parseClickHouseUrl(value.url);
    return {
      name: value.name,
      host: parsed.host,
      port: parsed.port,
      username: value.username,
      password: value.password,
      database: value.database,
      ssl: parsed.ssl,
    };
  },
  localTo: (value) => {
    return {
      name: value.name,
      driver: "clickhouse",
      url: buildClickHouseUrl(value.host, value.port, value.ssl),
      username: value.username,
      password: value.password,
      database: value.database,
    };
  },
};

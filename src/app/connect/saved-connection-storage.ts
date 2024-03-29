import parseSafeJson from "../../lib/json-safe";

export const DRIVER_DETAIL = Object.freeze({
  turso: {
    name: "turso",
    icon: "/turso.jpeg",
    prefill: "",
    endpointExample: "Example: libsql://example.turso.io",
    invalidateEndpoint: (url: string): null | string => {
      const trimmedUrl = url.trim();
      const valid =
        trimmedUrl.startsWith("https://") ||
        trimmedUrl.startsWith("http://") ||
        trimmedUrl.startsWith("ws://") ||
        trimmedUrl.startsWith("wss://") ||
        trimmedUrl.startsWith("libsql://");

      if (!valid) {
        return "Endpoint must start with libsql://, https://, http://, wss:// or ws://";
      }

      return null;
    },
  },
  rqlite: {
    name: "rqlite",
    icon: "/rqlite.png",
    prefill: "http://localhost:4001",
    endpointExample: "Example: http://localhost:4001",
    invalidateEndpoint: (url: string): null | string => {
      const trimmedUrl = url.trim();
      const valid =
        trimmedUrl.startsWith("https://") || trimmedUrl.startsWith("http://");

      if (!valid) {
        return "Endpoint must start with https://, http://";
      }

      return null;
    },
  },
});

export type SupportedDriver = keyof typeof DRIVER_DETAIL;
export type SavedConnectionStorage = "remote" | "local";
export type SavedConnectionLabel = "gray" | "red" | "yellow" | "green" | "blue";

export const CONNECTION_LABEL_COLORS: Record<SavedConnectionLabel, string> = {
  gray: "bg-gray-200 dark:bg-gray-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-800",
  blue: "bg-blue-800",
};

export interface SavedConnectionItem {
  id: string;
  driver?: SupportedDriver;
  storage: SavedConnectionStorage;
  name: string;
  description?: string;
  label?: SavedConnectionLabel;
}

export interface SavedConnectionItemConfigConfig {
  token: string;
  url: string;
  username?: string;
  password?: string;
}

export interface SavedConnectionItemConfig {
  name: string;
  driver?: SupportedDriver;
  label?: SavedConnectionLabel;
  description?: string;
  config: SavedConnectionItemConfigConfig;
}

export type SavedConnectionItemWithoutId = {
  storage: SavedConnectionStorage;
} & SavedConnectionItemConfig;

export type SavedConnectionItemDetail = {
  id: string;
} & SavedConnectionItemWithoutId;

interface SavedConnectionRawLocalStorage {
  id: string;
  name: string;
  url: string;
  token: string;
  driver?: SupportedDriver;
  label?: SavedConnectionLabel;
  description?: string;
  last_used: number;
}

function configToRaw(
  id: string,
  data: SavedConnectionItemConfig
): SavedConnectionRawLocalStorage {
  return {
    id,
    name: data.name,
    driver: data.driver ?? "turso",
    url: data.config?.url ?? "",
    token: data.config?.token ?? "",
    label: data.label,
    last_used: Date.now(),
    description: data.description ?? "",
  };
}

function mapRaw(data: SavedConnectionRawLocalStorage): SavedConnectionItem {
  return {
    storage: "local",
    label: data.label,
    driver: data.driver ?? "turso",
    id: data.id,
    name: data.name,
    description: data.description ?? "",
  };
}

function mapDetailRaw(
  data: SavedConnectionRawLocalStorage
): SavedConnectionItemDetail {
  return {
    storage: "local",
    id: data.id,
    driver: data.driver,
    name: data.name,
    description: data.description,
    label: data.label,
    config: {
      token: data.token,
      url: data.url,
    },
  };
}

function getAllConnections() {
  return parseSafeJson<SavedConnectionRawLocalStorage[]>(
    localStorage.getItem("connections"),
    []
  );
}

export class SavedConnectionLocalStorage {
  static getList(): SavedConnectionItem[] {
    return parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    ).map(mapRaw);
  }

  static remove(id: string) {
    const tmp = getAllConnections().filter((conn) => conn.id !== id);
    localStorage.setItem("connections", JSON.stringify(tmp));
  }

  static update(
    id: string,
    data: SavedConnectionItemConfig
  ): SavedConnectionItem {
    const tmp = getAllConnections().map((t) => {
      if (t.id === id) {
        return configToRaw(id, data);
      }

      return t;
    });

    localStorage.setItem("connections", JSON.stringify(tmp));

    return {
      id,
      name: data.name,
      storage: "local",
      description: data.description,
      label: data.label,
    };
  }

  static save(conn: SavedConnectionItemWithoutId): SavedConnectionItem {
    const uuid = crypto.randomUUID();
    const previousConnList = getAllConnections();

    localStorage.setItem(
      "connections",
      JSON.stringify([
        configToRaw(uuid, conn),
        ...previousConnList,
      ] as SavedConnectionRawLocalStorage[])
    );

    return {
      id: uuid,
      name: conn.name,
      driver: conn.driver,
      storage: "local",
      description: conn.description,
      label: conn.label,
    };
  }

  static get(id: string) {
    const found = parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    ).find((raw) => raw.id === id);

    if (found) return mapDetailRaw(found);
    return null;
  }
}

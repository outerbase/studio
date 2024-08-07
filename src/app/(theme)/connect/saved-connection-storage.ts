import { ApiUser } from "@/lib/api/api-database-response";
import parseSafeJson from "@/lib/json-safe";

export interface DriverDetailField {
  name: keyof SavedConnectionItemConfigConfig;
  type: "text" | "textarea" | "password" | "filehandler";
  secret?: boolean;
  required?: boolean;
  title?: string;
  placeholder?: string;
  description?: string;
  prefill?: string;
  invalidate?: (value: string) => string | null;
}

export interface DriverDetail {
  name: string;
  icon: string;
  disableRemote?: boolean;
  fields: DriverDetailField[];
}

export const DRIVER_DETAIL: Record<SupportedDriver, DriverDetail> =
  Object.freeze({
    "sqlite-filehandler": {
      name: "sqlite-filehandler",
      icon: "/sqlite-icon.svg",
      disableRemote: true,
      fields: [
        {
          name: "filehandler",
          required: true,
          type: "filehandler",
          title: "File",
          description: "",
        },
      ],
    },
    turso: {
      name: "turso",
      icon: "/turso.jpeg",
      fields: [
        {
          name: "url",
          required: true,
          type: "text",
          title: "URL",
          description: "Example: libsql://example.turso.io",
          invalidate: (url: string): null | string => {
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
        { name: "token", title: "Token", type: "textarea", secret: true },
      ],
    },
    valtown: {
      name: "valtown",
      icon: "/valtown.svg",
      prefill: "",
      fields: [
        {
          name: "token",
          title: "API Token",
          required: true,
          type: "text",
          secret: true,
        },
      ],
    },
    "cloudflare-d1": {
      name: "cloudflare-d1",
      icon: "/cloudflare.png",
      fields: [
        {
          name: "username",
          type: "text",
          title: "Account ID",
          required: true,
          placeholder: "Account ID",
        },
        {
          name: "database",
          type: "text",
          title: "Database ID",
          required: true,
          placeholder: "Database ID",
        },
        {
          name: "token",
          title: "API Token",
          required: true,
          type: "text",
          secret: true,
        },
      ],
    },
    rqlite: {
      name: "rqlite",
      icon: "/rqlite.png",
      fields: [
        {
          name: "url",
          required: true,
          type: "text",
          title: "URL",
          prefill: "http://localhost:4001",
          description: "Example: http://localhost:4001",
          invalidate: (url: string): null | string => {
            const trimmedUrl = url.trim();
            const valid =
              trimmedUrl.startsWith("https://") ||
              trimmedUrl.startsWith("http://");

            if (!valid) {
              return "Endpoint must start with https://, http://";
            }

            return null;
          },
        },
        {
          name: "username",
          type: "text",
          title: "Username",
          placeholder: "Username",
        },
        {
          name: "password",
          type: "password",
          title: "Password",
          secret: true,
          placeholder: "Password",
        },
      ],
    },
  });

export function validateConnectionString(
  driver: DriverDetail,
  connectionString?: SavedConnectionItemConfigConfig
) {
  if (!connectionString) return false;

  for (const field of driver.fields) {
    if (
      field.invalidate &&
      field.invalidate(connectionString[field.name] ?? "")
    ) {
      return false;
    }
  }

  return true;
}

export function prefillConnectionString(
  driver: DriverDetail,
  defaultValue?: SavedConnectionItemConfigConfig
): SavedConnectionItemConfigConfig {
  return {
    url:
      defaultValue?.url ??
      driver.fields.find((f) => f.name === "url")?.prefill ??
      "",
    token:
      defaultValue?.token ??
      driver.fields.find((f) => f.name === "token")?.prefill ??
      "",
    database:
      defaultValue?.database ??
      driver.fields.find((f) => f.name === "database")?.prefill ??
      "",
    username:
      defaultValue?.username ??
      driver.fields.find((f) => f.name === "username")?.prefill ??
      "",
    password:
      defaultValue?.token ??
      driver.fields.find((f) => f.name === "password")?.prefill ??
      "",
  };
}

export type SupportedDriver =
  | "turso"
  | "rqlite"
  | "valtown"
  | "cloudflare-d1"
  | "sqlite-filehandler";
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
  shared?: {
    sharedBy: ApiUser;
  };
}

export interface SavedConnectionItemConfigConfig {
  token: string;
  url: string;
  username?: string;
  password?: string;
  database?: string;
  filehandler?: string;
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
  username: string;
  password: string;
  database: string;
  driver?: SupportedDriver;
  label?: SavedConnectionLabel;
  file_handler?: string;
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
    file_handler: data.config?.filehandler,
    username: data.config?.username ?? "",
    password: data.config?.password ?? "",
    database: data.config?.database ?? "",
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
      password: data.password,
      username: data.username,
      database: data.database,
      filehandler: data.file_handler,
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

  static getDetailList(): SavedConnectionItemDetail[] {
    return parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    ).map(mapDetailRaw);
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

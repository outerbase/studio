import {
  CloudflareIcon,
  RqliteIcon,
  SQLiteIcon,
  StarbaseIcon,
  TursoIcon,
  ValtownIcon,
} from "@/components/icons/outerbase-icon";
import { ApiUser } from "@/lib/api/api-database-response";
import { FunctionComponent } from "react";

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
  displayName: string;
  name: string;
  icon: FunctionComponent<{ className: string }>;
  disableRemote?: boolean;
  fields: DriverDetailField[];
}

export const DRIVER_DETAIL: Record<SupportedDriver, DriverDetail> =
  Object.freeze({
    "sqlite-filehandler": {
      displayName: "SQLite",
      name: "sqlite-filehandler",
      icon: SQLiteIcon,
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
      displayName: "Turso",
      icon: TursoIcon,
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
      displayName: "Valtown",
      icon: ValtownIcon,
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
    starbase: {
      name: "starbase",
      displayName: "StarbaseDB",
      icon: StarbaseIcon,
      disableRemote: true,
      prefill: "",
      fields: [
        {
          name: "url",
          title: "Endpoint",
          required: true,
          type: "text",
          secret: false,
          invalidate: (url: string): null | string => {
            const trimmedUrl = url.trim();
            const valid =
              trimmedUrl.startsWith("https://") ||
              trimmedUrl.startsWith("http://");

            if (!valid) {
              return "Endpoint must start with https:// or http://";
            }

            return null;
          },
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
    "cloudflare-d1": {
      name: "cloudflare-d1",
      displayName: "Cloudflare D1",
      icon: CloudflareIcon,
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
      displayName: "rqlite",
      icon: RqliteIcon,
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
  | "starbase"
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
  token?: string;
  url?: string;
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

export interface SavedConnectionRawLocalStorage {
  id?: string;
  name: string;
  url?: string;
  token?: string;
  username?: string;
  password?: string;
  database?: string;
  driver?: SupportedDriver;
  label?: SavedConnectionLabel;
  file_handler?: string;
  description?: string;
  last_used?: number;
}

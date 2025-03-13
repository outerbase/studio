export type SupportedDriver =
  | "turso"
  | "rqlite"
  | "valtown"
  | "starbase"
  | "cloudflare-d1"
  | "cloudflare-wae"
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
  starbase_type?: string;
}

import parseSafeJson from "../../lib/json-safe";

export type SavedConnectionStorage = "e2e" | "local_storage";
export type SavedConnectionLabel = "gray" | "red" | "yellow" | "green" | "blue";

export const CONNECTION_LABEL_COLORS: Record<SavedConnectionLabel, string> = {
  gray: "bg-gray-200",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-800",
  blue: "bg-blue-800",
};

export interface SavedConnectionItem {
  id: string;
  storage: SavedConnectionStorage;
  name: string;
  description?: string;
  label?: SavedConnectionLabel;
}

export interface SavedConnectionItemConfig {
  name: string;
  label?: SavedConnectionLabel;
  description?: string;
  config: {
    token: string;
    url: string;
  };
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
  label?: SavedConnectionLabel;
  description?: string;
  last_used: number;
}

export class SavedConnectionLocalStorage {
  static getList(): SavedConnectionItem[] {
    return parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    ).map((conn) => ({
      storage: "local_storage",
      label: conn.label,
      id: conn.id,
      name: conn.name,
      description: conn.description ?? "",
    }));
  }

  static save(conn: SavedConnectionItemWithoutId): SavedConnectionItemDetail {
    const uuid = crypto.randomUUID();
    const finalConn = { ...conn, id: uuid };

    const previousConnList = parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    );

    localStorage.setItem(
      "connections",
      JSON.stringify([
        {
          id: finalConn.id,
          name: finalConn.name,
          url: finalConn.config.url,
          token: finalConn.config.token,
          label: finalConn.label,
          last_used: Date.now(),
          description: finalConn.description ?? "",
        },
        ...previousConnList,
      ] as SavedConnectionRawLocalStorage[])
    );

    return finalConn;
  }
}

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

function configToRaw(
  id: string,
  data: SavedConnectionItemConfig
): SavedConnectionRawLocalStorage {
  return {
    id,
    name: data.name,
    url: data.config.url,
    token: data.config.token,
    label: data.label,
    last_used: Date.now(),
    description: data.description ?? "",
  };
}

function mapRaw(data: SavedConnectionRawLocalStorage): SavedConnectionItem {
  return {
    storage: "local_storage",
    label: data.label,
    id: data.id,
    name: data.name,
    description: data.description ?? "",
  };
}

function mapDetailRaw(
  data: SavedConnectionRawLocalStorage
): SavedConnectionItemDetail {
  return {
    storage: "local_storage",
    id: data.id,
    name: data.name,
    description: data.description,
    label: data.label,
    config: {
      token: data.token,
      url: data.url,
    },
  };
}

export class SavedConnectionLocalStorage {
  static getList(): SavedConnectionItem[] {
    return parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    ).map(mapRaw);
  }

  static update(
    id: string,
    data: SavedConnectionItemConfig
  ): SavedConnectionItem {
    const previousConnList = parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    );

    const tmp = previousConnList.map((t) => {
      if (t.id === id) {
        return configToRaw(id, data);
      }

      return t;
    });

    localStorage.setItem("connections", JSON.stringify(tmp));

    return {
      id,
      name: data.name,
      storage: "local_storage",
      description: data.description,
      label: data.label,
    };
  }

  static save(conn: SavedConnectionItemWithoutId): SavedConnectionItem {
    const uuid = crypto.randomUUID();
    const previousConnList = parseSafeJson<SavedConnectionRawLocalStorage[]>(
      localStorage.getItem("connections"),
      []
    );

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
      storage: "local_storage",
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

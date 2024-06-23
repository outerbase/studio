import {
  SavedConnectionItem,
  SavedConnectionItemConfig,
  SupportedDriver,
} from "@/app/connect/saved-connection-storage";
import { ApiDatabasesResponse } from "../api-response-types";

export async function getDatabases(): Promise<ApiDatabasesResponse> {
  const result = await fetch("/api/databases");
  return await result.json();
}

export async function createDatabase(
  data: SavedConnectionItemConfig & { driver: SupportedDriver }
): Promise<{ data: SavedConnectionItem }> {
  const r = await fetch(`/api/database`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await r.json();
}

export async function updateDatabase(
  id: string,
  data: SavedConnectionItemConfig
) {
  const r = await fetch(`/api/database/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await r.json();
}

export async function getDatabase(
  id: string
): Promise<SavedConnectionItemConfig> {
  const result = await fetch(`/api/database/${id}`);
  return await result.json();
}

export async function deleteDatabase(
  id: string
): Promise<SavedConnectionItemConfig> {
  const result = await fetch(`/api/database/${id}`, { method: "DELETE" });
  return await result.json();
}

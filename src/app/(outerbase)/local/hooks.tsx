import { SavedConnectionRawLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import { LocalConnectionData, LocalDashboardData, localDb } from "@/indexdb";
import { generateId } from "@/lib/generate-id";
import parseSafeJson from "@/lib/json-safe";
import useSWR, { mutate } from "swr";

export function useLocalDashboardList() {
  return useSWR(
    "/dashboards/local",
    () => {
      return localDb.board.toCollection().toArray();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );
}

export async function createLocalDashboard(boardName: string) {
  const id = generateId();
  const now = Date.now();

  const data: LocalDashboardData = {
    id,
    created_at: now,
    updated_at: now,
    name: boardName,
    layout: [],
    charts: [],
    data: {
      filters: [],
    },
  };

  await localDb.table("board").add({ id, content: data });
  return data;
}

export async function deleteLocalDashboard(boardId: string) {
  await localDb.table("board").delete(boardId);
  mutate("/dashboards/local");
}

export function useLocalConnectionList() {
  return useSWR(
    "/connections/local",
    async (): Promise<LocalConnectionData[]> => {
      // Migrate the connection from local storage to indexdb
      if (localStorage.getItem("connections")) {
        const legacyList = parseSafeJson<SavedConnectionRawLocalStorage[]>(
          localStorage.getItem("connections") ?? "[]",
          []
        );

        if (legacyList.length) {
          const list = legacyList.map((conn) => {
            return {
              id: conn.id!,
              content: conn,
              created_at: Date.now(),
              updated_at: conn.last_used ?? Date.now(),
            };
          });

          try {
            await localDb.connection.bulkAdd(list);
          } catch (e) {
            console.log(e);
          }

          localStorage.removeItem("connections");
          return list;
        }

        localStorage.removeItem("connections");
      }

      return await localDb.connection.toCollection().toArray();
    }
  );
}

export function useLocalConnection(id: string) {
  return useSWR(
    `/connections/local/${id}`,
    async (): Promise<LocalConnectionData | undefined> => {
      return await localDb.connection.get(id);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );
}

export async function removeLocalConnection(id: string) {
  await localDb.connection.delete(id);
  mutate("/connections/local");
}

export async function createLocalConnection(
  config: SavedConnectionRawLocalStorage
): Promise<LocalConnectionData> {
  const id = generateId();

  const data = {
    id,
    content: config,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  await localDb.connection.put(data);
  mutate("/connections/local");

  return data;
}

export async function updateLocalConnection(
  id: string,
  config: SavedConnectionRawLocalStorage
) {
  const oldData = await localDb.connection.get(id);
  if (!oldData) return;

  const data = {
    id,
    content: config,
    updated_at: Date.now(),
    created_at: oldData.created_at,
  };

  await localDb.connection.put(data);

  mutate("/connections/local");
  mutate("/connections/local/" + id, data, {
    optimisticData: data,
    revalidate: false,
  });

  return data;
}

export async function updateLocalConnectionUsed(id: string) {
  const oldData = await localDb.connection.get(id);
  if (!oldData) return;

  const data = {
    ...oldData,
    updated_at: Date.now(),
  };

  await localDb.connection.put(data);
  mutate("/connections/local");

  return data;
}

export async function getLocalConnectionList() {
  return await localDb.connection.toCollection().toArray();
}

export async function getLocalConnection(id: string) {
  return await localDb.connection.get(id);
}

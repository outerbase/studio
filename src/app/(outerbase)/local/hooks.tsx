import { LocalDashboardData, localDb } from "@/indexdb";
import useSWR from "swr";

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
  const id = crypto.randomUUID();
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

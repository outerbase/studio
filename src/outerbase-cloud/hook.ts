import { useState } from "react";
import useSWR from "swr";
import { getOuterbaseBase, getOuterbaseDashboardList } from "./api";
import { OuterbaseAPIError } from "./api-type";
import { getOuterbaseBaseCredential } from "./api-workspace";

export default function useOuterbaseMutation<
  Arguments extends unknown[] = unknown[],
  ReturnType = unknown,
>(handler: (...arg: Arguments) => Promise<ReturnType>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OuterbaseAPIError>();

  const trigger = async (...args: Arguments) => {
    setLoading(true);
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof OuterbaseAPIError) {
        setError(e);
      } else {
        throw e;
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, trigger, error };
}

export function useOuterbaseDashboardList() {
  const { data, isLoading, mutate } = useSWR(
    "/dashboards",
    async () => {
      const result = await getOuterbaseDashboardList();
      return result.items;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      revalidateIfStale: false,
    }
  );

  return { data, isLoading, mutate };
}

export function useOuterbaseBase(workspaceId: string, baseId: string) {
  const { data, isLoading, mutate } = useSWR(
    `/base/${baseId}`,
    async () => {
      const result = await getOuterbaseBase(workspaceId, baseId);
      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      revalidateIfStale: false,
    }
  );

  return { data, isLoading, mutate };
}

export function useOuterbaseBaseCredential(
  workspaceId: string,
  sourceId: string
) {
  const { data, isLoading, mutate } = useSWR(
    sourceId ? `/source/${sourceId}/credential` : null,
    async () => {
      const result = await getOuterbaseBaseCredential(workspaceId, sourceId);
      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      revalidateIfStale: false,
    }
  );

  return { data, isLoading, mutate };
}

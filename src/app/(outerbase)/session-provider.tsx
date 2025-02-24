"use client";
import { useRouter } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import useSWR, { mutate } from "swr";
import { getOuterbaseSession } from "../../outerbase-cloud/api";
import {
  OuterbaseAPISession,
  OuterbaseAPIUser,
} from "../../outerbase-cloud/api-type";

interface OuterebaseSessionContextProps {
  isLoading: boolean;
  token?: string;
  session?: {
    session: OuterbaseAPISession;
    user: OuterbaseAPIUser;
  };
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const OuterbaseSessionContext = createContext<OuterebaseSessionContextProps>({
  isLoading: true,
  logout: () => {},
  refreshSession: async () => {},
});

export function useSession() {
  return useContext(OuterbaseSessionContext);
}

export function OuterbaseSessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ob-token") || "" : "";

  const { data, isLoading } = useSWR(
    token ? "session-" + token : undefined,
    () => {
      return getOuterbaseSession();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const refreshSession = useCallback(async () => {
    if (!token) return;
    await mutate("session-" + token);
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem("session");
    localStorage.removeItem("ob-token");

    router.push("/signin");
  }, [router]);

  return (
    <OuterbaseSessionContext.Provider
      value={{ session: data, isLoading, token, logout, refreshSession }}
    >
      {children}
    </OuterbaseSessionContext.Provider>
  );
}

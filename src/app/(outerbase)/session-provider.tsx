"use client";
import { createContext, PropsWithChildren, useContext } from "react";
import useSWR from "swr";
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
}

const OuterbaseSessionContext = createContext<OuterebaseSessionContextProps>({
  isLoading: true,
});

export function useSession() {
  return useContext(OuterbaseSessionContext);
}

export function OuterbaseSessionProvider({ children }: PropsWithChildren) {
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

  return (
    <OuterbaseSessionContext.Provider
      value={{ session: data, isLoading, token }}
    >
      {children}
    </OuterbaseSessionContext.Provider>
  );
}

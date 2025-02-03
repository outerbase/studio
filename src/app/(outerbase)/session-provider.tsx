"use client";
import { useRouter } from "next/navigation";
import { createContext, PropsWithChildren, useContext } from "react";
import useSWR from "swr";
import { getOuterbaseSession } from "../../outerbase-cloud/api";
import {
  OuterbaseAPISession,
  OuterbaseAPIUser,
} from "../../outerbase-cloud/api-type";

interface OuterebaseSessionContextProps {
  session: OuterbaseAPISession;
  user: OuterbaseAPIUser;
}

const OuterbaseSessionContext = createContext<{
  session: OuterbaseAPISession;
  user: OuterbaseAPIUser;
}>({} as OuterebaseSessionContextProps);

export function useSession() {
  return useContext(OuterbaseSessionContext);
}

export function OuterbaseSessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  const { data, isLoading } = useSWR(
    "session",
    () => {
      return getOuterbaseSession();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (isLoading) {
    return <div>Session Loading...</div>;
  }

  if (!data?.session || !data?.user) {
    router.push("/signin");
    return <div>Redirecting...</div>;
  }

  return (
    <OuterbaseSessionContext.Provider
      value={{ session: data?.session, user: data?.user }}
    >
      {children}
    </OuterbaseSessionContext.Provider>
  );
}

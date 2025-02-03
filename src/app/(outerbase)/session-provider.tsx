"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
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
  const pathname = usePathname();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ob-token") : "";

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

  useEffect(() => {
    if (isLoading) return;
    if (!data?.session || !data?.user) {
      localStorage.setItem("continue-redirect", pathname);
      router.push("/signin");
    }
  }, [isLoading, data, pathname, router]);

  if (isLoading || !data) {
    return <div>Session Loading...</div>;
  }

  return (
    <OuterbaseSessionContext.Provider
      value={{ session: data?.session, user: data?.user }}
    >
      {children}
    </OuterbaseSessionContext.Provider>
  );
}

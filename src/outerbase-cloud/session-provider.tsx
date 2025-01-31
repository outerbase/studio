"use client";
import { useRouter } from "next/navigation";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { getOuterbaseSession } from "./api";
import { OuterbaseAPISession, OuterbaseAPIUser } from "./api-type";

interface OuterebaseSessionContextProps {
  session: OuterbaseAPISession;
  user: OuterbaseAPIUser;
}

const OuterbaseSessionContext = createContext<{
  session: OuterbaseAPISession;
  user: OuterbaseAPIUser;
}>({} as OuterebaseSessionContextProps);

export function OuterbaseSessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<OuterbaseAPISession>();
  const [user, setUser] = useState<OuterbaseAPIUser>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("ob-token");
    if (!token) return;

    getOuterbaseSession()
      .then((r) => {
        setSession(r.session);
        setUser(r.user);
      })
      .catch(() => {
        router.push("/signin");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div>Session Loading...</div>;
  }

  if (!session || !user) {
    return <div>Something wrong!</div>;
  }

  return (
    <OuterbaseSessionContext.Provider value={{ session, user }}>
      {children}
    </OuterbaseSessionContext.Provider>
  );
}

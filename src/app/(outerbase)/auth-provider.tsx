"use client";
import PageLoading from "@/components/page-loading";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "./session-provider";

export default function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, session } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!session?.session || !session?.user) {
      localStorage.setItem("continue-redirect", pathname);
      router.replace("/signin");
    }
  }, [isLoading, session, pathname, router]);

  if (isLoading || !session) {
    return <PageLoading>Session Loading...</PageLoading>;
  }

  return <>{children}</>;
}

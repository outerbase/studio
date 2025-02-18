"use client";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "./session-provider";

export default function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, session } = useSession();

  useEffect(() => {
    if (isLoading) return;
    const redirect = localStorage.getItem("continue-redirect");
    if (!session?.session || !session?.user) {
      localStorage.setItem("continue-redirect", pathname);
      router.replace("/signin");
      // IF user enabled 2FA keep redirect to verify page
    } else if (session.user.has_otp && redirect === "/verify") {
      router.replace(redirect);
    } else {
      localStorage.removeItem("continue-redirect");
    }
  }, [isLoading, session, pathname, router]);

  return <>{children}</>;
}

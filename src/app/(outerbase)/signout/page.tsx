"use client";

import { Loader } from "@/components/orbit/loader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "../session-provider";

export default function SignoutPage() {
  const { logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    logout();
    router.push("/");
  }, [router, logout]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Loader size={40} />
      <p>Signing out....</p>
    </div>
  );
}

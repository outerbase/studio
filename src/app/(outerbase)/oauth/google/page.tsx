"use client";
import { Loader } from "@/components/orbit/loader";
import { getOuterbaseSessionFromGoogleCode } from "@/outerbase-cloud/api";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "../../session-provider";

export default function GoogleOAuthCallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { refreshSession } = useSession();

  useEffect(() => {
    if (!code) return;

    // Submit the code to the server to get session token
    getOuterbaseSessionFromGoogleCode(code).then((session) => {
      localStorage.setItem("ob-token", session.token);
      localStorage.setItem("session", JSON.stringify(session));

      const continueRedirect = localStorage.getItem("continue-redirect");

      refreshSession();

      if (continueRedirect) {
        localStorage.removeItem("continue-redirect");
        window.location.href = continueRedirect;
      } else {
        window.location.href = "/";
      }
    });
  }, [code, refreshSession]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader size={60} />
    </div>
  );
}

"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect, useLayoutEffect } from "react";
import DatabaseGui from "./database-gui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./context-menu-handler";
import InternalPubSub from "@/lib/internal-pubsub";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizeConnectionEndpoint } from "@/lib/validation";
import { SchemaProvider } from "@/context/SchemaProvider";
import ThemeProvider from "@/context/theme-provider";

export interface ConnectionCredential {
  url: string;
  token: string;
}

function MainConnection({
  credential,
}: {
  credential: {
    url: string;
    token: string;
  };
}) {
  const database = useMemo(() => {
    return new DatabaseDriver(credential.url, credential.token);
  }, [credential]);

  useEffect(() => {
    return () => {
      database.close();
    };
  }, [database]);

  return (
    <ThemeProvider>
      <DatabaseDriverProvider driver={database}>
        <SchemaProvider>
          <DatabaseGui />
        </SchemaProvider>
      </DatabaseDriverProvider>
    </ThemeProvider>
  );
}

function InvalidSession() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <div></div>;
}

function MainConnectionContainer({
  credential,
}: Readonly<{ credential: ConnectionCredential }>) {
  const router = useRouter();

  /**
   * We use useLayoutEffect because it executes before
   * other component mount. Since we need to attach the
   * message handler first before children component
   * start listening and sending message to each other
   */
  useLayoutEffect(() => {
    console.info("Injecting message into window object");
    window.internalPubSub = new InternalPubSub();
  }, [credential, router]);

  useEffect(() => {
    if (credential.url) {
      document.title = credential.url + " - LibSQL Studio";
    }
  }, [credential]);

  return credential?.url ? (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection credential={credential} />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  ) : (
    <InvalidSession />
  );
}

export default function MainScreen() {
  const params = useSearchParams();

  const finalCredential = useMemo(() => {
    const connectionParams = params.get("c");
    if (connectionParams) {
      const [port, token] = connectionParams.split(":");
      return {
        url: "ws://localhost:" + port,
        token,
      };
    }

    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");
    return {
      url: normalizeConnectionEndpoint(config.url),
      token: config.token as string,
    };
  }, [params]);

  return <MainConnectionContainer credential={finalCredential} />;
}

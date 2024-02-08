"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect, useState, useLayoutEffect } from "react";
import DatabaseGui from "./DatabaseGui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./ContentMenuHandler";
import InternalPubSub from "@/lib/internal-pubsub";
import { useRouter } from "next/navigation";
import { normalizeConnectionEndpoint } from "@/lib/validation";
import { SchemaProvider } from "@/screens/DatabaseScreen/SchemaProvider";

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
    <DatabaseDriverProvider driver={database}>
      <DatabaseGui />
    </DatabaseDriverProvider>
  );
}

function InvalidSession() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <div></div>;
}

export default function MainScreen() {
  const router = useRouter();
  const sessionCredential: { url: string; token: string } = useMemo(() => {
    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");
    return {
      url: normalizeConnectionEndpoint(config.url),
      token: config.token,
    };
  }, []);

  /**
   * We use useLayoutEffect because it executes before
   * other component mount. Since we need to attach the
   * message handler first before children component
   * start listening and sending message to each other
   */
  useLayoutEffect(() => {
    console.info("Injecting message into window object");
    window.internalPubSub = new InternalPubSub();
  }, [sessionCredential, router]);

  useEffect(() => {
    if (sessionCredential.url) {
      document.title = sessionCredential.url + " - LibSQL Studio";
    }
  }, [sessionCredential]);

  return sessionCredential?.url ? (
    <>
      <AutoCompleteProvider>
        <SchemaProvider>
          <TooltipProvider>
            <MainConnection credential={sessionCredential} />
          </TooltipProvider>
        </SchemaProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  ) : (
    <InvalidSession />
  );
}

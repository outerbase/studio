"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect, useState, useLayoutEffect } from "react";
import DatabaseGui from "./DatabaseGui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./ContentMenuHandler";
import InternalPubSub from "@/lib/internal-pubsub";
import { useParams } from "next/navigation";

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

export default function MainScreen() {
  const { session_id: sessionId } = useParams<{ session_id: string }>();

  const sessionCredential: { url: string; token: string } = useMemo(() => {
    return JSON.parse(sessionStorage.getItem("sess_" + sessionId) ?? "{}");
  }, [sessionId]);

  /**
   * We use useLayoutEffect because it executes before
   * other component mount. Since we need to attach the
   * message handler first before children component
   * start listening and sending message to each other
   */
  useLayoutEffect(() => {
    console.info("Injecting message into window object");
    window.internalPubSub = new InternalPubSub();
  }, []);

  return (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection credential={sessionCredential} />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  );
}

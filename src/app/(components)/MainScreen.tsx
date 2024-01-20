"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect, useState, useLayoutEffect } from "react";
import DatabaseGui from "./DatabaseGui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { ConnectionConfigScreen } from "./ConnectionConfigScreen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./ContentMenuHandler";
import InternalPubSub from "@/lib/internal-pubsub";

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
  const [credential, setCredential] = useState<{
    url: string;
    token: string;
  } | null>(
    process.env.NEXT_PUBLIC_TESTING_DATABASE_URL
      ? {
          url: process.env.NEXT_PUBLIC_TESTING_DATABASE_URL as string,
          token: process.env.NEXT_PUBLIC_TESTING_DATABASE_TOKEN as string,
        }
      : null
  );

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

  return credential ? (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection credential={credential} />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  ) : (
    <div className="flex flex-wrap w-screen h-screen justify-center content-center">
      <ConnectionConfigScreen onConnect={setCredential} />
    </div>
  );
}

"use client";
import { useEffect, useLayoutEffect } from "react";
import DatabaseGui from "./database-gui";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./context-menu-handler";
import InternalPubSub from "@/lib/internal-pubsub";
import { useRouter } from "next/navigation";
import { SchemaProvider } from "@/context/SchemaProvider";
import { BlockEditorProvider } from "@/context/block-editor-provider";
import { useConnectionConfig } from "@/context/connection-config-provider";

export interface ConnectionCredential {
  url: string;
  token: string;
}

function MainConnection() {
  const { databaseDriver: driver } = useDatabaseDriver();

  useEffect(() => {
    return () => {
      driver.close();
    };
  }, [driver]);

  return (
    <SchemaProvider>
      <BlockEditorProvider>
        <DatabaseGui />
      </BlockEditorProvider>
    </SchemaProvider>
  );
}

function MainConnectionContainer() {
  const router = useRouter();
  const { databaseDriver: driver } = useDatabaseDriver();
  const { config } = useConnectionConfig();

  /**
   * We use useLayoutEffect because it executes before
   * other component mount. Since we need to attach the
   * message handler first before children component
   * start listening and sending message to each other
   */
  useLayoutEffect(() => {
    console.info("Injecting message into window object");
    window.internalPubSub = new InternalPubSub();
  }, [driver, router]);

  useEffect(() => {
    document.title = config.name + " - LibSQL Studio";
  }, [config]);

  return (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  );
}

export default function MainScreen() {
  return <MainConnectionContainer />;
}

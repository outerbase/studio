"use client";
import { useEffect, useLayoutEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ContextMenuHandler from "./context-menu-handler";
import { useRouter } from "next/navigation";
import { useDatabaseDriver } from "@/contexts/driver-provider";
import DatabaseGui from "./database-gui";
import { useConfig } from "@/contexts/config-provider";
import { AutoCompleteProvider } from "@/contexts/auto-complete-provider";
import { BlockEditorProvider } from "@/contexts/block-editor-provider";
import InternalPubSub from "@/lib/internal-pubsub";
import { SchemaProvider } from "@/contexts/schema-provider";

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
  const { name } = useConfig();

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
    document.title = name + " - LibSQL Studio";
  }, [name]);

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

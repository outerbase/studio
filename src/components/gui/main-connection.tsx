"use client";
import { useEffect, useLayoutEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ContextMenuHandler from "./context-menu-handler";
import { useDatabaseDriver } from "@/context/driver-provider";
import DatabaseGui from "./database-gui";
import { useConfig } from "@/context/config-provider";
import { AutoCompleteProvider } from "@/context/auto-complete-provider";
import InternalPubSub from "@/components/lib/internal-pubsub";
import { SchemaProvider } from "@/context/schema-provider";

function MainConnection() {
  const { databaseDriver: driver } = useDatabaseDriver();

  useEffect(() => {
    return () => {
      driver.close();
    };
  }, [driver]);

  return (
    <SchemaProvider>
      <DatabaseGui />
    </SchemaProvider>
  );
}

function MainConnectionContainer() {
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
  }, [driver]);

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

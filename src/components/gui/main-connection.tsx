"use client";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDatabaseDriver } from "@/context/driver-provider";
import DatabaseGui from "./database-gui";
import { useConfig } from "@/context/config-provider";
import { AutoCompleteProvider } from "@/context/auto-complete-provider";
import { SchemaProvider } from "@/context/schema-provider";
import { WEBSITE_NAME } from "@/const";
import ContextMenuHandler from "./context-menu-handler";

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
  const { name } = useConfig();

  useEffect(() => {
    document.title = name + " - " + WEBSITE_NAME;
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

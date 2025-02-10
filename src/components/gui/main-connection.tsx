"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WEBSITE_NAME } from "@/const";
import { AutoCompleteProvider } from "@/context/auto-complete-provider";
import { useConfig } from "@/context/config-provider";
import { useDatabaseDriver } from "@/context/driver-provider";
import { SchemaProvider } from "@/context/schema-provider";
import { useEffect } from "react";
import { DialogProvider } from "../create-dialog";
import ContextMenuHandler from "./context-menu-handler";
import DatabaseGui from "./database-gui";

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
      <DialogProvider slot="base" />
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

"use client";
import { useEffect, useLayoutEffect } from "react";
import DatabaseGui from "./database-gui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoCompleteProvider } from "@/context/AutoCompleteProvider";
import ContextMenuHandler from "./context-menu-handler";
import InternalPubSub from "@/lib/internal-pubsub";
import { useRouter } from "next/navigation";
import { SchemaProvider } from "@/context/SchemaProvider";
import { BaseDriver } from "@/drivers/base-driver";
import { SavedConnectionLabel } from "@/app/connect/saved-connection-storage";
import { BlockEditorProvider } from "@/context/block-editor-provider";

export interface ConnectionCredential {
  url: string;
  token: string;
}

function MainConnection({
  driver,
  color,
}: {
  driver: BaseDriver;
  color: SavedConnectionLabel;
}) {
  useEffect(() => {
    return () => {
      driver.close();
    };
  }, [driver]);

  return (
    <DatabaseDriverProvider driver={driver}>
      <SchemaProvider>
        <BlockEditorProvider>
          <DatabaseGui color={color} />
        </BlockEditorProvider>
      </SchemaProvider>
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

function MainConnectionContainer({
  driver,
  color,
}: Readonly<{ driver: BaseDriver; color: SavedConnectionLabel }>) {
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
  }, [driver, router]);

  useEffect(() => {
    if (driver.getEndpoint()) {
      document.title = driver.getEndpoint() + " - LibSQL Studio";
    }
  }, [driver]);

  return driver ? (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection driver={driver} color={color} />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  ) : (
    <InvalidSession />
  );
}

export default function MainScreen({
  driver,
  color,
}: {
  driver: BaseDriver;
  color: SavedConnectionLabel;
}) {
  return <MainConnectionContainer driver={driver} color={color} />;
}

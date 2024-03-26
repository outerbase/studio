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
import { BlockEditorProvider } from "@/context/block-editor-provider";
import { useConnectionConfig } from "@/context/connection-config-provider";

export interface ConnectionCredential {
  url: string;
  token: string;
}

function MainConnection({ driver }: { driver: BaseDriver }) {
  useEffect(() => {
    return () => {
      driver.close();
    };
  }, [driver]);

  return (
    <DatabaseDriverProvider driver={driver}>
      <SchemaProvider>
        <BlockEditorProvider>
          <DatabaseGui />
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

function MainConnectionContainer({ driver }: Readonly<{ driver: BaseDriver }>) {
  const router = useRouter();
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

  return driver ? (
    <>
      <AutoCompleteProvider>
        <TooltipProvider>
          <MainConnection driver={driver} />
        </TooltipProvider>
      </AutoCompleteProvider>
      <ContextMenuHandler />
    </>
  ) : (
    <InvalidSession />
  );
}

export default function MainScreen({ driver }: { driver: BaseDriver }) {
  return <MainConnectionContainer driver={driver} />;
}

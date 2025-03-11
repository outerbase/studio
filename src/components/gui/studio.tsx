"use client";
import MainScreen from "@/components/gui/main-connection";
import {
  StudioContextProps,
  StudioContextProvider,
} from "@/context/driver-provider";
import { StudioExtensionManager } from "@/core/extension-manager";
import { BeforeQueryPipeline } from "@/core/query-pipeline";
import AgentDriverList from "@/drivers/agent/list";
import type { BaseDriver } from "@/drivers/base-driver";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { useEffect, useMemo, useRef } from "react";
import { CommonDialogProvider } from "../common-dialog";
import { FullEditorProvider } from "./providers/full-editor-provider";

interface StudioProps {
  driver: BaseDriver;
  extensions?: StudioExtensionManager;
  agentDriver?: AgentDriverList;
  docDriver?: SavedDocDriver;
  name: string;
  color: string;
  onBack?: () => void;
  theme?: "dark" | "light";
  containerClassName?: string;
}

export function Studio({
  driver,
  name,
  color,
  onBack,
  extensions,
  containerClassName,
  docDriver,
  agentDriver,
}: Readonly<StudioProps>) {
  const extensionRef = useRef<StudioExtensionManager | undefined | null>(
    extensions
  );

  useEffect(() => {
    extensionRef.current = extensions;
  }, [extensions]);

  const proxyDriver = useMemo(() => {
    return new Proxy(driver, {
      get(...arg) {
        const [target, property] = arg;

        if (property === "query") {
          return async (statement: string) => {
            const beforePipeline = new BeforeQueryPipeline("query", [
              statement,
            ]);

            if (extensionRef.current) {
              await extensionRef.current.beforeQuery(beforePipeline);
            }

            return await target.query(beforePipeline.getStatments()[0]);
          };
        } else if (property === "transaction" || property === "batch") {
          return async (statements: string[]) => {
            const beforePipeline = new BeforeQueryPipeline(property, [
              ...statements,
            ]);

            if (extensionRef.current) {
              await extensionRef.current.beforeQuery(beforePipeline);
            }

            return await target.transaction(beforePipeline.getStatments());
          };
        }

        return Reflect.get(...arg);
      },
    });
  }, [driver, extensionRef]);

  const finalExtensionManager = useMemo(() => {
    return extensions ?? new StudioExtensionManager([]);
  }, [extensions]);

  useEffect(() => {
    return () => finalExtensionManager.cleanup();
  }, [finalExtensionManager]);

  const studioContextValue: StudioContextProps = useMemo(() => {
    return {
      name,
      color,
      onBack,
      extensions: finalExtensionManager,
      containerClassName,
      agentDriver,
      databaseDriver: proxyDriver,
      docDriver,
    };
  }, [
    name,
    color,
    onBack,
    finalExtensionManager,
    containerClassName,
    agentDriver,
    proxyDriver,
    docDriver,
  ]);

  return (
    <StudioContextProvider value={studioContextValue}>
      <CommonDialogProvider>
        <FullEditorProvider>
          <MainScreen />
        </FullEditorProvider>
      </CommonDialogProvider>
    </StudioContextProvider>
  );
}

"use client";
import MainScreen from "@/components/gui/main-connection";
import { ConfigProvider } from "@/context/config-provider";
import { DriverProvider } from "@/context/driver-provider";
import type { BaseDriver } from "@/drivers/base-driver";
import { ReactElement, useMemo } from "react";
import OptimizeTableState from "@/components/gui/table-optimized/OptimizeTableState";
import { StudioContextMenuItem } from "@/messages/open-context-menu";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { FullEditorProvider } from "./providers/full-editor-provider";
import { CommonDialogProvider } from "../common-dialog";

export interface StudioExtension {
  contextMenu?: (state: OptimizeTableState) => StudioContextMenuItem[];
}

interface StudioProps {
  driver: BaseDriver;
  collaboration?: CollaborationBaseDriver;
  docDriver?: SavedDocDriver;
  name: string;
  color: string;
  onBack?: () => void;
  sideBarFooterComponent?: ReactElement;
  theme?: "dark" | "light";
  extensions?: StudioExtension[];
}

export function Studio({
  driver,
  collaboration,
  docDriver,
  name,
  color,
  extensions,
  sideBarFooterComponent,
  onBack,
}: Readonly<StudioProps>) {
  const proxyDriver = useMemo(() => {
    return new Proxy(driver, {
      get(...arg) {
        const [target, property] = arg;

        if (property === "query") {
          return async (statement: string) => {
            console.group("Query");
            console.info(`%c${statement}`, "color:#e67e22");
            console.groupEnd();
            return await target.query(statement);
          };
        } else if (property === "transaction") {
          return async (statements: string[]) => {
            console.group("Transaction");
            statements.forEach((s) => console.log(`%c${s}`, "color:#e67e22"));
            console.groupEnd();
            return await target.transaction(statements);
          };
        }

        return Reflect.get(...arg);
      },
    });
  }, [driver]);

  return (
    <DriverProvider
      driver={proxyDriver}
      collaborationDriver={collaboration}
      docDriver={docDriver}
    >
      <ConfigProvider
        extensions={extensions}
        name={name}
        color={color}
        onBack={onBack}
        sideBarFooterComponent={sideBarFooterComponent}
      >
        <CommonDialogProvider>
          <FullEditorProvider>
            <MainScreen />
          </FullEditorProvider>
        </CommonDialogProvider>
      </ConfigProvider>
    </DriverProvider>
  );
}

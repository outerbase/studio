import { StudioExtensionManager } from "@/core/extension-manager";
import AgentDriverList from "@/drivers/agent/list";
import type { BaseDriver } from "@/drivers/base-driver";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { noop } from "lodash";
import { type PropsWithChildren, createContext, useContext } from "react";

export interface StudioContextProps {
  databaseDriver: BaseDriver;
  docDriver?: SavedDocDriver;

  // Moving from useConfig previously
  color: string;
  name: string;
  onBack?: () => void;
  extensions: StudioExtensionManager;
  containerClassName?: string;
  agentDriver?: AgentDriverList;
}

const StudioContext = createContext<StudioContextProps>({
  databaseDriver: {} as unknown as BaseDriver,
  name: "",
  color: "",
  extensions: new StudioExtensionManager([]),
  onBack: noop,
  containerClassName: "",
});

export function useStudioContext() {
  return useContext(StudioContext);
}

export function StudioContextProvider({
  children,
  value,
}: PropsWithChildren<{ value: StudioContextProps }>) {
  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

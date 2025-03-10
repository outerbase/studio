import { StudioExtensionManager } from "@/core/extension-manager";
import AgentDriverList from "@/drivers/agent/list";
import { noop } from "lodash";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

interface ConfigContextProps {
  color: string;
  name: string;
  onBack?: () => void;
  extensions: StudioExtensionManager;
  containerClassName?: string;
  agentDriver?: AgentDriverList;
}

const ConfigContext = createContext<ConfigContextProps>({
  name: "",
  color: "",
  extensions: new StudioExtensionManager([]),
  onBack: noop,
  containerClassName: "",
});

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({
  children,
  config,
}: PropsWithChildren<{ config: ConfigContextProps }>) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

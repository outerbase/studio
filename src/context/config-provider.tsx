import { StudioExtension } from "@/extension";
import type { PropsWithChildren, ReactElement } from "react";
import { createContext, useContext, useMemo } from "react";

interface ConfigContextProps {
  color: string;
  name: string;
  onBack?: () => void;
  sideBarFooterComponent?: ReactElement;
  extensions?: StudioExtension[];
}

const ConfigContext = createContext<ConfigContextProps>({
  name: "",
  color: "",
  onBack: () => {
    throw new Error("Not implemented");
  },
});

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({
  children,
  color,
  name,
  onBack,
  extensions,
  sideBarFooterComponent,
}: PropsWithChildren<ConfigContextProps>) {
  const memo = useMemo(
    () => ({ color, name, onBack, sideBarFooterComponent, extensions }),
    [name, color, onBack, sideBarFooterComponent, extensions]
  );

  return (
    <ConfigContext.Provider value={memo}>{children}</ConfigContext.Provider>
  );
}

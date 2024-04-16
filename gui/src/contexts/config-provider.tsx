import type { PropsWithChildren, ReactElement } from "react";
import { createContext, useContext, useMemo } from "react";

interface ConfigContextProps {
  color: string;
  name: string;
  onBack: () => void;
  sideBarFooterComponent?: ReactElement;
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
  sideBarFooterComponent,
}: PropsWithChildren<ConfigContextProps>) {
  const memo = useMemo(
    () => ({ color, name, onBack, sideBarFooterComponent }),
    [name, color, onBack, sideBarFooterComponent]
  );

  return (
    <ConfigContext.Provider value={memo}>{children}</ConfigContext.Provider>
  );
}

import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";

interface ConfigContextProps {
  color: string;
  name: string;
  onBack: () => void;
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
}: PropsWithChildren<ConfigContextProps>) {
  const memo = useMemo(() => ({ color, name, onBack }), [name, color, onBack]);

  return (
    <ConfigContext.Provider value={memo}>{children}</ConfigContext.Provider>
  );
}

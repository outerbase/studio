import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

const ConnectionConfigContext = createContext<{
  config?: SavedConnectionItem;
}>({});

export function useConnectionConfig() {
  const { config } = useContext(ConnectionConfigContext);
  if (!config) throw new Error("Need Connection Config Provider");
  return { config };
}

export function ConnectionConfigProvider({
  children,
  config,
}: PropsWithChildren<{ config: SavedConnectionItem }>) {
  const contextMemo = useMemo(() => ({ config }), [config]);

  return (
    <ConnectionConfigContext.Provider value={contextMemo}>
      {children}
    </ConnectionConfigContext.Provider>
  );
}

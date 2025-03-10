import type { BaseDriver } from "@/drivers/base-driver";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { type PropsWithChildren, createContext, useContext } from "react";

const DriverContext = createContext<{
  databaseDriver: BaseDriver;
  docDriver?: SavedDocDriver;
}>({
  databaseDriver: {} as unknown as BaseDriver,
});

export function useDatabaseDriver() {
  return useContext(DriverContext);
}

export function DriverProvider({
  children,
  driver,
  docDriver,
}: PropsWithChildren<{
  driver: BaseDriver;
  docDriver?: SavedDocDriver;
}>) {
  return (
    <DriverContext.Provider value={{ databaseDriver: driver, docDriver }}>
      {children}
    </DriverContext.Provider>
  );
}

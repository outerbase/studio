import type { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { SavedDocDriver } from "@/drivers/saved-doc/saved-doc-driver";
import { type PropsWithChildren, createContext, useContext } from "react";

const DriverContext = createContext<{
  databaseDriver: BaseDriver;
  collaborationDriver?: CollaborationBaseDriver;
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
  collaborationDriver,
  docDriver,
}: PropsWithChildren<{
  driver: BaseDriver;
  collaborationDriver?: CollaborationBaseDriver;
  docDriver?: SavedDocDriver;
}>) {
  return (
    <DriverContext.Provider
      value={{ databaseDriver: driver, collaborationDriver, docDriver }}
    >
      {children}
    </DriverContext.Provider>
  );
}

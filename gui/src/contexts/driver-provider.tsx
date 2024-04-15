import type { BaseDriver } from "@gui/drivers/base-driver";
import type { CollaborationDriver } from "@gui/drivers/collaboration-driver";
import { type PropsWithChildren, createContext, useContext } from "react";

const DriverContext = createContext<{
  databaseDriver: BaseDriver;
  collaborationDriver?: CollaborationDriver;
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
}: PropsWithChildren<{
  driver: BaseDriver;
  collaborationDriver?: CollaborationDriver;
}>) {
  return (
    <DriverContext.Provider
      value={{ databaseDriver: driver, collaborationDriver }}
    >
      {children}
    </DriverContext.Provider>
  );
}

import type { BaseDriver } from "@/drivers/base-driver";
import type { CollaborationDriver } from "@/drivers/collaboration-driver";
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

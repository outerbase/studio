import type { BaseDriver } from "@/drivers/base-driver";
import { CollaborationBaseDriver } from "@/drivers/collaboration-driver-base";
import { type PropsWithChildren, createContext, useContext } from "react";

const DriverContext = createContext<{
  databaseDriver: BaseDriver;
  collaborationDriver?: CollaborationBaseDriver;
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
  collaborationDriver?: CollaborationBaseDriver;
}>) {
  return (
    <DriverContext.Provider
      value={{ databaseDriver: driver, collaborationDriver }}
    >
      {children}
    </DriverContext.Provider>
  );
}

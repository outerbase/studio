import { BaseDriver } from "@/drivers/base-driver";
import CollaborationDriver from "@/drivers/collaboration-driver";
import { PropsWithChildren, createContext, useContext } from "react";

const DatabaseDriverContext = createContext<{
  databaseDriver: BaseDriver;
  collaborationDriver?: CollaborationDriver;
}>({
  databaseDriver: {} as unknown as BaseDriver,
});

export function useDatabaseDriver() {
  return useContext(DatabaseDriverContext);
}

export function DatabaseDriverProvider({
  children,
  driver,
  collaborationDriver,
}: PropsWithChildren<{
  driver: BaseDriver;
  collaborationDriver?: CollaborationDriver;
}>) {
  return (
    <DatabaseDriverContext.Provider
      value={{ databaseDriver: driver, collaborationDriver }}
    >
      {children}
    </DatabaseDriverContext.Provider>
  );
}

import { BaseDriver } from "@/drivers/base-driver";
import { PropsWithChildren, createContext, useContext } from "react";

const DatabaseDriverContext = createContext<{ databaseDriver: BaseDriver }>({
  databaseDriver: {} as unknown as BaseDriver,
});

export function useDatabaseDriver() {
  return useContext(DatabaseDriverContext);
}

export function DatabaseDriverProvider({
  children,
  driver,
}: PropsWithChildren<{ driver: BaseDriver }>) {
  return (
    <DatabaseDriverContext.Provider value={{ databaseDriver: driver }}>
      {children}
    </DatabaseDriverContext.Provider>
  );
}

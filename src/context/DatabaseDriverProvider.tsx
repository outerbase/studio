import DatabaseDriver from "@/drivers/DatabaseDriver";
import { PropsWithChildren, createContext, useContext } from "react";

const DatabaseDriverContext = createContext<{ databaseDriver: DatabaseDriver }>(
  {
    databaseDriver: {} as DatabaseDriver,
  }
);

export function useDatabaseDriver() {
  return useContext(DatabaseDriverContext);
}

export function DatabaseDriverProvider({
  children,
  driver,
}: PropsWithChildren<{ driver: DatabaseDriver }>) {
  return (
    <DatabaseDriverContext.Provider value={{ databaseDriver: driver }}>
      {children}
    </DatabaseDriverContext.Provider>
  );
}

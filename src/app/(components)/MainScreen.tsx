"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect } from "react";
import DatabaseGui from "./DatabaseGui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";

export default function MainScreen() {
  const database = useMemo(() => {
    return new DatabaseDriver(
      process.env.NEXT_PUBLIC_TESTING_DATABASE_URL as string,
      process.env.NEXT_PUBLIC_TESTING_DATABASE_TOKEN as string
    );
  }, []);

  useEffect(() => {
    return () => {
      database.close();
    };
  }, [database]);

  return (
    <DatabaseDriverProvider driver={database}>
      <DatabaseGui />
    </DatabaseDriverProvider>
  );
}

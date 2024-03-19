"use client";

import MainScreen from "@/components/main-connection";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo } from "react";

export default function ClientPageBody() {
  const driver = useMemo(() => {
    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");
    return new DatabaseDriver(config.url, config.token as string);
  }, []);

  return <MainScreen driver={driver} />;
}

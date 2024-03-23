"use client";

import MainScreen from "@/components/main-connection";
import TursoDriver from "@/drivers/turso-driver";
import { useMemo } from "react";

export default function ClientPageBody() {
  const driver = useMemo(() => {
    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");
    return new TursoDriver(config.url, config.token as string);
  }, []);

  return <MainScreen driver={driver} color="blue" />;
}

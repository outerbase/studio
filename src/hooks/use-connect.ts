"use client";
import {
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "@/app/(theme)/connect/saved-connection-storage";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function useConnect() {
  const router = useRouter();

  return useCallback(
    (driver: SupportedDriver, config: SavedConnectionItemConfigConfig) => {
      sessionStorage.setItem(
        "connection",
        JSON.stringify({
          driver,
          url: config.url,
          token: config.token,
          username: config.username,
          password: config.password,
          database: config.database,
        })
      );

      router.push(`/client/${driver ?? "turso"}`);
    },
    [router]
  );
}

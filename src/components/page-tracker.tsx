"use client";

import { addTrackEvent, normalizedPathname } from "@/lib/tracking";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageTracker() {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    const normalized = normalizedPathname(pathname);

    addTrackEvent("pageview", {
      path: normalized,
      full_path: pathname === normalized ? undefined : pathname,
    });
  }, [pathname]);

  // Track unhandle rejection
  useEffect(() => {
    window.addEventListener("unhandledrejection", (event) => {
      if (typeof event.reason === "string") {
        addTrackEvent("unhandledrejection", {
          message: event.reason,
        });
      } else if (event.reason?.message) {
        addTrackEvent("unhandledrejection", {
          message: event.reason.message,
          stack: event.reason.stack,
        });
      } else {
        addTrackEvent("unhandledrejection", event.toString());
      }
    });

    return () => {
      window.removeEventListener("unhandledrejection", () => {});
    };
  }, []);

  return null;
}

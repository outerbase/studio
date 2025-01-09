"use client";

import { sendAnalyticEvents, normalizedPathname } from "@/lib/tracking";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageTracker() {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    const normalized = normalizedPathname(pathname);

    sendAnalyticEvents([
      {
        name: "page_view",
        data: {
          path: normalized,
          full_path: pathname === normalized ? undefined : pathname,
        },
      },
    ]);
  }, [pathname]);

  // Track unhandle rejection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: PromiseRejectionEvent) => {
      if (typeof event.reason === "string") {
        sendAnalyticEvents([
          {
            name: "unhandledrejection",
            data: { message: event.reason, path: window.location.pathname },
          },
        ]);
      } else if (event.reason?.message) {
        sendAnalyticEvents([
          {
            name: "unhandledrejection",
            data: {
              message: event.reason.message,
              stack: event.reason.stack,
              path: window.location.pathname,
            },
          },
        ]);
      } else {
        sendAnalyticEvents([
          {
            name: "unhandledrejection",
            data: {
              message: event.toString(),
            },
          },
        ]);
      }
    };

    window.addEventListener("unhandledrejection", handler);

    return () => {
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  // Track other unhandled error
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: ErrorEvent) => {
      sendAnalyticEvents([
        {
          name: "error",
          data: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      ]);
    };

    window.addEventListener("error", handler);
    return () => {
      window.removeEventListener("error", handler);
    };
  }, []);

  return null;
}

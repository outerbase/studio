import { generateId } from "./generate-id";
import { throttleEvent } from "./tracking-throttle";

export interface TrackEventItem {
  name: string;
  data?: unknown;
}

export function normalizedPathname(pathname: string) {
  const patterns = {
    "/playground/mysql/[roomName]": /\/playground\/mysql\/(\w)+/i,
  };

  for (const [pattern, reg] of Object.entries(patterns)) {
    if (reg.test(pathname)) {
      return pattern;
    }
  }

  return pathname;
}

export function sendAnalyticEvents(events: TrackEventItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  if (!process.env.NEXT_PUBLIC_ANALYTIC_ENABLED) return;

  /**
   * Some error send at very high rate, we need to throttle them
   * to prevent the server from being overwhelmed.
   */
  const finalEvents = events.filter((e) => {
    if (!["unhandledrejection", "error"].includes(e.name)) return true;
    return throttleEvent(e.name, 5, 5000);
  });

  if (finalEvents.length === 0) return;

  let deviceId = localStorage.getItem("od-id");
  if (!deviceId) {
    deviceId = generateId();
    localStorage.setItem("od-id", deviceId);
  }

  fetch("/api/events", {
    method: "POST",
    body: JSON.stringify({
      events: finalEvents,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-od-id": deviceId,
    },
  })
    .then()
    .catch();
}

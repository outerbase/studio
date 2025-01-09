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

  let deviceId = localStorage.getItem("od-id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("od-id", deviceId);
  }

  fetch("/api/events", {
    method: "POST",
    body: JSON.stringify({
      events,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-od-id": deviceId,
    },
  })
    .then()
    .catch();
}
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

export function addTrackEvent(eventName: string, data?: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  if (!process.env.NEXT_PUBLIC_ANALYTIC_ENABLED) return;

  window.navigator.sendBeacon(
    "/api/events",
    JSON.stringify({
      events: [{ name: eventName, data }],
    })
  );
}

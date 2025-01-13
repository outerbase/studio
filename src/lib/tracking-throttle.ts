const THROTTLE_COUNT: Record<string, number> = {};
const THROTTLE_TIMESTAMP: Record<string, number> = {};

/**
 * Throttle event by name by number of limit event in interval
 *
 * @param name Event name
 * @param time Number of limit event in interval
 * @param interval Time interval in milliseconds before reset the throttle
 * @returns
 */
export function throttleEvent(name: string, time: number, interval: number) {
  console.log(
    "throttleEvent",
    THROTTLE_COUNT,
    THROTTLE_TIMESTAMP,
    name,
    (THROTTLE_COUNT[name] ?? 0) > time
  );

  if (Date.now() - (THROTTLE_TIMESTAMP[name] ?? 0) < interval) {
    THROTTLE_COUNT[name] = (THROTTLE_COUNT[name] ?? 0) + 1;
    return (THROTTLE_COUNT[name] ?? 0) > time;
  } else {
    THROTTLE_COUNT[name] = 0;
    THROTTLE_TIMESTAMP[name] = Date.now();
  }

  return false;
}

export default function parseSafeJson<T = unknown>(
  str: string | null | undefined,
  defaultValue: T
): T {
  if (!str) return defaultValue;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

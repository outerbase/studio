export default function parseSafeJson<T = unknown>(
  str: string | null | undefined,
  defaultValue: T
): T {
  if (!str) return defaultValue;

  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

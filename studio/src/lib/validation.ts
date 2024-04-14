export function isLinkString(str: string) {
  if (str.length > 200) return false;
  try {
    return Boolean(new URL(str));
  } catch {
    return false;
  }
}

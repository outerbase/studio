export function isLinkString(str: string) {
  if (str.length > 200) return false;

  try {
    return ["http:", "https:"].includes(new URL(str).protocol);
  } catch {
    return false;
  }
}

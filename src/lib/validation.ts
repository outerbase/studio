export function isLinkString(str: string) {
  if (str.length > 200) return false;

  let url;

  try {
    url = new URL(str);
  } catch {
    return false;
  }

  return ["http:", "https:"].includes(url.protocol);
}

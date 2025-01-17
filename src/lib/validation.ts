export function isLinkString(str: string) {
  if (str.length > 200) return false;

  try {
    let isUrl = Boolean(new URL(str));

    //Using regex check string is url combining with new URL(str)
    const regex = /http:|https:|(\.w+)/g;

    if (!str.match(regex)) {
      isUrl = false;
    }

    return isUrl;
  } catch {
    return false;
  }
}

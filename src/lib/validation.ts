export function validateConnectionEndpoint(
  endpoint: string
): [boolean, string] {
  try {
    const url = new URL(endpoint);

    if (url.protocol !== "wss:") {
      return [true, "We only support wss:// at the moment."];
    }

    return [false, ""];
  } catch {
    return [true, "Your URL is not valid"];
  }
}

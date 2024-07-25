function extractCredentialsAndPrepareHeaders(url: string) {
  const parsedUrl = new URL(url);

  // Extract credentials from the URL
  const { username, password } = parsedUrl;

  // Remove username and password from the URL to clean it
  parsedUrl.username = "";
  parsedUrl.password = "";

  // Prepare the Authorization header
  let options = {};

  if (username || password) {
    const base64Credentials = btoa(`${username}:${password}`);
    options = {
      headers: { Authorization: `Basic ${base64Credentials}` },
    };
  }
  // Return the cleaned URL and the headers
  return {
    cleanedUrl: parsedUrl.href,
    options,
  };
}

export default function downloadFileFromUrl(url: string) {
  const { cleanedUrl, options } = extractCredentialsAndPrepareHeaders(url);
  return fetch(cleanedUrl, options).then((r) => r.arrayBuffer());
}

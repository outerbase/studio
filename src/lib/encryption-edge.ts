const RANDOM_IV_LENGTH = 12;
const AUTH_TAG_SIZE = 16;

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: Uint8Array) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function encrypt(keyInBase64: string, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(RANDOM_IV_LENGTH));
  const encoded = new TextEncoder().encode(text);
  const keyBuffer = base64ToArrayBuffer(keyInBase64);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const c = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: AUTH_TAG_SIZE * 8 },
    key,
    encoded
  );

  return arrayBufferToBase64(new Uint8Array([...iv, ...new Uint8Array(c)]));
}

export async function decrypt(keyInBase64: string, base64: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(keyInBase64),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const e = base64ToArrayBuffer(base64);
  const iv = e.slice(0, RANDOM_IV_LENGTH);
  const content = e.slice(RANDOM_IV_LENGTH);

  const c = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: AUTH_TAG_SIZE * 8 },
    key,
    content
  );

  return new TextDecoder().decode(c);
}

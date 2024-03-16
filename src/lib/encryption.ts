// https://github.com/mdn/dom-examples/blob/main/web-crypto/derive-key/pbkdf2.js
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: Uint8Array) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function generateAesKey() {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function generateAesKeyFromPassword(
  password: string,
  salt: ArrayBuffer
) {
  const enc = new TextEncoder();

  const material = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 2145,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBytes(key: CryptoKey, data: ArrayBufferLike) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const c = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new Uint8Array([...iv, ...new Uint8Array(c)]);
}

export async function decryptBytes(key: CryptoKey, data: ArrayBufferLike) {
  const iv = data.slice(0, 12);
  const c = data.slice(12);

  const d = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    c
  );

  return d;
}

export async function encryptTextToBase64(key: CryptoKey, text: string) {
  const encoded = new TextEncoder().encode(text);
  return arrayBufferToBase64(await encryptBytes(key, encoded));
}

export async function decryptBase64ToText(key: CryptoKey, base64: string) {
  const d = await decryptBytes(key, base64ToArrayBuffer(base64));
  return new TextDecoder().decode(d);
}

import crypto from "crypto";

const RANDOM_IV_LENGTH = 12;
const AUTH_TAG_SIZE = 16;

export function encrypt(key: Buffer, text: string) {
  const iv = crypto.randomBytes(RANDOM_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_SIZE,
  });

  return Buffer.concat([
    iv,
    cipher.update(Buffer.from(text)),
    cipher.final(),
    cipher.getAuthTag(),
  ]).toString("base64");
}

export function decrypt(key: Buffer, base64: string) {
  const e = Buffer.from(base64, "base64");
  const iv = e.subarray(0, RANDOM_IV_LENGTH);
  const content = e.subarray(RANDOM_IV_LENGTH, -AUTH_TAG_SIZE);
  const tag = e.subarray(-AUTH_TAG_SIZE);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(content), decipher.final()]);
  return plain.toString();
}

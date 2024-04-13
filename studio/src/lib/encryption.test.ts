import crypto from "crypto";
import { decrypt, encrypt } from "./encryption";

test("Encrypt and decrypt should reverse each other", () => {
  const key = crypto.randomBytes(32);
  const text = "Hello World";
  expect(decrypt(key, encrypt(key, text))).toBe(text);
});

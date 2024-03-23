import crypto from "crypto";

/**
 * Generate md5 hash of a string
 * @param input - string to hash
 * @returns md5 hashed string
 */
export const md5 = (input: crypto.BinaryLike) => {
  return crypto.createHash("md5").update(input).digest("hex");
};

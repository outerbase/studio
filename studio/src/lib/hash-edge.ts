import { scoped } from "./utils";

/**
 * Generate a SHA-1 hash of a string or BufferSource using the Web Crypto API
 * @param input - string or BufferSource to hash
 * @returns Promise that resolves to the hashed string
 */
export const hash = async (input: string | BufferSource) => {
  // Convert the input string to a Uint8Array

  const data = scoped(() => {
    if (typeof input === "string") {
      return new TextEncoder().encode(input);
    }
    return input;
  });

  const subtle = crypto.subtle;

  const hashBuffer = await subtle.digest("SHA-1", data);

  // Convert the hashBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

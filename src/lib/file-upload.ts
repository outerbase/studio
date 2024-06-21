import { Result, err, ok } from "@justmiracle/result";
import { safeFetch } from "./utils";

export interface TriggerFileUploadOptions {
  /**
   * Maximum file size in bytes
   * @default 10MB
   **/
  maxSize?: number;

  /**
   * Maximum number of files that can be selected
   * @default 1
   **/
  maxFiles?: number;

  /**
   * Accept attribute for the file input
   * @default ""
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
   *
   * @example
   * // Accepts only images
   * accept="image/*"
   *
   * // Accepts only images and videos
   * accept="image/*,video/*"
   *
   * // Accepts only .jpg files
   * accept="image/jpg"
   **/
  accept?: string;
}

const DEFAULT_ACCEPT = ""; // No restrictions
const DEFAULT_MAX_SIZE = 1024 * 1024 * 10; // 10MB
const DEFAULT_MAX_FILES = 1;

export const triggerSelectFiles = (
  options?: TriggerFileUploadOptions
): Promise<Result<File[]>> => {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    maxFiles = DEFAULT_MAX_FILES,
    accept = DEFAULT_ACCEPT,
  } = options || {};

  return new Promise<Result<File[]>>((resolve, reject) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    // options
    fileInput.accept = accept;
    fileInput.multiple = maxFiles > 1;

    fileInput.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);

      if (!files.length) {
        return reject(err("No files selected"));
      }

      // Check if the number of files exceeds the maximum limit
      if (maxFiles && files.length > maxFiles) {
        return reject(
          err("Too many files selected, maximum allowed is " + maxFiles)
        );
      }

      const invalidFileSizes = Array.from(files).some(
        (file) => file.size > maxSize
      );

      if (invalidFileSizes) {
        return reject(
          err("Some file's size exceeds the maximum limit of " + maxSize)
        );
      }

      return resolve(ok(Array.from(files)));
    };

    fileInput.click();
  });
};

/**
 * Upload a file to the server
 *
 * @param file - The file to upload
 * @returns The url of the uploaded file
 *
 * @example
 *
 * const { data } = await uploadFile(file)
 * console.log(data?.url)
 * // https://r2.example.com/filename.jpg
 */
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return safeFetch<{ url: string }>("/api/upload", {
    method: "POST",
    body: formData,
  });
}

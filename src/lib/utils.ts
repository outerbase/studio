import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Funny workaround to make a scoped feature
 */
export function scoped<T>(fn: () => T): T {
  return fn();
}

/**
 * Doesn't do anything :)
 */
export function noop() {}

/**
 * Join everything together into a string
 *
 * @example
 * const result = concat("henlo", "-", "world")
 * // "henlo-world"
 */
export function concat(...inputs: string[]) {
  return inputs.join("");
}

export interface ApiErrorResponse {
  message: string;
  detailedMessage?: string;
}

/**
 * Safely fetch data with a slightly typed response
 *
 * @example
 *
 * const { data, error } = await safeFetch<User>(url)
 * if (error) {
 *   console.log(error.message, error.detailedMessage)
 * } else {
 *  console.log(data) // type User
 * }
 */
export async function safeFetch<Success>(
  url: string | URL,
  init?: RequestInit
): Promise<
  | {
      data: Success;
      error: null;
      response: Response;
    }
  | {
      data: null;
      error: ApiErrorResponse;
      response: Response;
    }
> {
  let response: Response = new Response();
  try {
    response = await fetch(url, init);
    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json?.error || json, response };
    } else {
      const data = await response.json();
      return { data, error: null, response };
    }
  } catch (e) {
    if (e instanceof Error) {
      return {
        response,
        data: null,
        error: { message: "Something went wrong", detailedMessage: e.message },
      };
    }

    return {
      response,
      data: null,
      error: { message: "Unknown Error", detailedMessage: JSON.stringify(e) },
    };
  }
}

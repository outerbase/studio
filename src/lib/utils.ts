import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export interface ApiErrorResponse {
  message: string;
  detailedMessage?: string;
}

export function strippedWorkspaceName(value: string) {
  return value
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/[^a-zA-Z 0-9]/g, "")
    .replace(/[^A-Z0-9]/gi, "-")
    ?.toLowerCase();
}

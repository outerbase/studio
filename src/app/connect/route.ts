// This route is maintained to redirect the old path to the new /local route.
// It ensures compatibility for users accessing the old website links
// that have not yet been updated to the new URL.

import { redirect } from "next/navigation";

export const GET = function () {
  return redirect("/local");
}
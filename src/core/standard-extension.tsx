/**
 * This contains the standard extensions as a base for all databases.
 */

import NotebookExtension from "@/extensions/notebook";
import QueryHistoryConsoleLogExtension from "@/extensions/query-console-log";

export function createStandardExtensions() {
  return [new QueryHistoryConsoleLogExtension(), new NotebookExtension()];
}

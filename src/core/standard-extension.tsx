/**
 * This contains the standard extensions as a base for all databases.
 */

import QueryHistoryConsoleLogExtension from "@/extensions/query-console-log";
import ViewEditorExtension from "@/extensions/view-editor";
import TriggerEditorExtension from "@/extensions/trigger-editor";
import ColumnDescriptorExtension from "@/extensions/column-descriptor";

export function createStandardExtensions() {
  return [
    new QueryHistoryConsoleLogExtension(),
    new ViewEditorExtension(),
    new ColumnDescriptorExtension(),
  ];
}

export function createSQLiteExtensions() {
  return [...createStandardExtensions(), new TriggerEditorExtension()];
}

export function createMySQLExtensions() {
  return [...createStandardExtensions(), new TriggerEditorExtension()];
}

export function createPostgreSQLExtensions() {
  return createStandardExtensions();
}

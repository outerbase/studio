/**
 * This contains the standard extensions as a base for all databases.
 */

import ColumnDescriptorExtension from "@/extensions/column-descriptor";
import DataCatalogExtension from "@/extensions/data-catalog";
import DataCatalogInmemoryDriver from "@/extensions/data-catalog/driver-inmemory";
import QueryHistoryConsoleLogExtension from "@/extensions/query-console-log";
import TriggerEditorExtension from "@/extensions/trigger-editor";
import ViewEditorExtension from "@/extensions/view-editor";

export function createStandardExtensions() {
  return [
    new QueryHistoryConsoleLogExtension(),
    new ViewEditorExtension(),
    new ColumnDescriptorExtension(),
    new DataCatalogExtension(
      new DataCatalogInmemoryDriver(
        {
          main: {
            testing: {
              schemaName: "main",
              tableName: "testing",
              columns: {
                id: {
                  name: "id",
                  definition: "This is ID of the testing",
                  samples: ["1", "2", "3"],
                  hideFromEzql: false,
                },
                name: {
                  name: "name",
                  definition: "This is some random comment",
                  samples: ["John", "Doe"],
                  hideFromEzql: false,
                },
              },
              definition: "",
            },
          },
        },
        { delay: 1000 }
      )
    ),
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

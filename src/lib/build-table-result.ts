import { OptimizeTableHeaderProps } from "@/components/gui/table-optimized";
import { TableHeaderMetadata } from "@/components/gui/table-result/type";
import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseSchemas,
  DatabaseTableSchema,
} from "@/drivers/base-driver";
import { ColumnType } from "@outerbase/sdk-transform";
import { LucideKey, LucideKeySquare, LucideSigma } from "lucide-react";

export interface BuildTableResultProps {
  result: DatabaseResultSet;
  driver: BaseDriver;
  tableSchema?: DatabaseTableSchema;
  schemas: DatabaseSchemas;
}

function pipeAttachColumnViaSchemas(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[],
  { tableSchema, schemas, driver }: BuildTableResultProps
) {
  // If there is already table schema, we use it instead because it is more accurate.
  if (tableSchema) return;

  for (const header of headers) {
    // We got no column information from database
    if (!header.metadata.from) continue;

    const from = header.metadata.from;
    const schema = schemas[from.schema];
    if (!schema) continue;

    const table = schema.find((t) => t.tableName === from.table);
    if (!table) continue;

    const currentTableSchema = table.tableSchema;
    if (!currentTableSchema) continue;

    if (currentTableSchema.pk.includes(from.column)) {
      header.metadata.isPrimaryKey = true;
    }

    const columnSchema = currentTableSchema.columns.find(
      (c) => c.name.toLowerCase() === from.column.toLowerCase()
    );

    if (!columnSchema) continue;

    header.metadata.type =
      header.metadata.type ?? driver.inferTypeFromHeader(columnSchema);

    header.metadata.columnSchema = columnSchema;
  }
}

function pipeWithTableSchema(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[],
  { tableSchema, driver }: BuildTableResultProps
) {
  if (!tableSchema) return;

  for (const header of headers) {
    const columnSchema = tableSchema.columns.find(
      (c) => c.name.toLowerCase() === header.name.toLowerCase()
    );

    header.metadata.columnSchema = columnSchema;
    header.metadata.originalType = columnSchema?.type;
    header.metadata.type =
      header.metadata.type ?? driver.inferTypeFromHeader(columnSchema);

    header.metadata.from = {
      schema: tableSchema.schemaName,
      table: tableSchema.tableName!,
      column: header.name,
    };

    // Attaching the primary key
    if (
      tableSchema.pk
        .map((p) => p.toLowerCase())
        .includes(header.name.toLowerCase())
    ) {
      header.metadata.isPrimaryKey = true;
    }

    // Attaching the foreign key from column constraint
    if (
      columnSchema &&
      columnSchema.constraint?.foreignKey &&
      columnSchema.constraint.foreignKey.foreignColumns
    ) {
      header.metadata.referenceTo = {
        schema: columnSchema.constraint.foreignKey.foreignSchemaName!,
        table: columnSchema.constraint.foreignKey.foreignTableName!,
        column: columnSchema.constraint.foreignKey.foreignColumns[0]!,
      };
    }

    // Attaching the foreign key from table constraint
    if (tableSchema.constraints) {
      for (const constraint of tableSchema.constraints) {
        if (constraint.foreignKey && constraint.foreignKey.columns) {
          const foundIndex = constraint.foreignKey.columns.indexOf(header.name);
          if (foundIndex !== -1) {
            header.metadata.referenceTo = {
              schema: constraint.foreignKey.foreignSchemaName!,
              table: constraint.foreignKey.foreignTableName!,
              column: constraint.foreignKey.columns[foundIndex]!,
            };
          }
        }
      }
    }
  }
}

/**
 * Initially, all columns are set to readonly. We will determine which
 * columns are editable based on the availability of primary key information.
 * Since a query result can contain multiple tables, we need to verify
 * the readonly status of each column according to the table schema.
 */
function pipeEditableTable(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[],
  { schemas }: BuildTableResultProps
) {
  const tables: {
    schema: string;
    table: string;
    columns: string[];
    pkColumns: string[];
  }[] = [];

  for (const header of headers) {
    const from = header.metadata.from;

    if (from && header.metadata.isPrimaryKey) {
      const table = tables.find(
        (t) => t.schema === from.schema && t.table === from.table
      );

      if (table) {
        table.columns.push(from.column);
      } else {
        const pkColumns =
          schemas[from.schema].find((t) => t.tableName === from.table)
            ?.tableSchema?.pk ?? [];

        tables.push({
          schema: from.schema,
          table: from.table,
          columns: [from.column],
          pkColumns,
        });
      }
    }
  }

  for (const table of tables) {
    let editable = false;
    const matchedColumns = table.columns.filter((c) =>
      table.pkColumns.includes(c)
    );

    // Mark table as editable if all primary key columns are matched
    if (matchedColumns.length === table.pkColumns.length) {
      editable = true;
    }

    // In SQLite, we can use rowid as a primary key if there is no primary key
    if (
      !editable &&
      table.pkColumns.length === 0 &&
      table.columns.length === 1 &&
      table.columns[0] === "rowid"
    ) {
      editable = true;
    }

    // If the table is editable, we will mark the whole columns that belongs to
    // that table as editable.
    if (editable) {
      for (const header of headers) {
        const from = header.metadata.from;

        if (
          from &&
          from.schema === table.schema &&
          from.table === table.table
        ) {
          header.setting.readonly = false;
        }
      }
    }
  }
}

export function pipeVirtualColumnAsReadOnly(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[]
) {
  for (const header of headers) {
    if (header.metadata.columnSchema?.constraint?.generatedExpression) {
      header.setting.readonly = true;
    }
  }
}

export function pipeCloudflareSpecialTable(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[]
) {
  for (const header of headers) {
    if (header.metadata.from?.table === "_cf_KV") {
      header.setting.readonly = true;
    }
  }
}

export function pipeCalculateInitialSize(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[],
  { result }: BuildTableResultProps
) {
  for (const header of headers) {
    const dataType = header.metadata.type;
    let initialSize = 100;

    if (dataType === ColumnType.INTEGER || dataType === ColumnType.REAL) {
      initialSize = 100;
    } else if (dataType === ColumnType.TEXT) {
      // Use 100 first rows to determine the good initial size
      let maxSize = 0;
      for (let i = 0; i < Math.min(result.rows.length, 100); i++) {
        const currentCell = result.rows[i];

        if (currentCell) {
          maxSize = Math.max(
            (currentCell[header.name ?? ""]?.toString() ?? "").length,
            maxSize
          );
        }
      }

      initialSize = Math.max(150, Math.min(500, maxSize * 8));
    }

    header.display.initialSize = initialSize;
  }
}

export function pipeColumnIcon(
  headers: OptimizeTableHeaderProps<TableHeaderMetadata>[]
) {
  for (const header of headers) {
    if (header.metadata.isPrimaryKey) {
      header.display.icon = LucideKey;
      header.display.iconClassName = "text-neutral-950 dark:text-neutral-50";
    } else if (header.metadata.referenceTo) {
      header.display.icon = LucideKeySquare;
      header.display.iconClassName = "text-neutral-950 dark:text-neutral-50";
    } else if (header.metadata.columnSchema?.constraint?.generatedExpression) {
      header.display.icon = LucideSigma;
      header.display.iconClassName = "text-neutral-950 dark:text-neutral-50";
    }
  }
}

export function buildTableResultHeader(
  props: BuildTableResultProps
): OptimizeTableHeaderProps<TableHeaderMetadata>[] {
  const { result } = props;

  const headers = result.headers.map((column) => {
    let from: { schema: string; table: string; column: string } | null = null;

    if (column.table && column.schema) {
      from = {
        schema: column.schema,
        table: column.table,
        column: column.originalName ?? column.name,
      };
    }

    return {
      store: new Map(),
      name: column.name,
      display: {
        text: column.displayName,
      },
      setting: {
        readonly: true,
        resizable: true,
      },
      metadata: {
        type: column.type,
        originalType: column.originalType,
        ...(from ? { from } : {}),
      },
    } as OptimizeTableHeaderProps<TableHeaderMetadata>;
  });

  pipeWithTableSchema(headers, props);
  pipeAttachColumnViaSchemas(headers, props);
  pipeEditableTable(headers, props);
  pipeVirtualColumnAsReadOnly(headers);
  pipeCloudflareSpecialTable(headers);
  pipeCalculateInitialSize(headers, props);
  pipeColumnIcon(headers);

  return headers;
}

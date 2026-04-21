import { isEqual, omit } from "lodash";
import {
  BaseDriver,
  DatabaseTableColumn,
  DatabaseTableSchemaChange,
} from "../base-driver";

function generateCreateColumn(
  driver: BaseDriver,
  col: DatabaseTableColumn
): string {
  const tokens: string[] = [driver.escapeId(col.name), col.type];

  // ClickHouse expresses nullability via the Nullable(T) wrapper in the
  // type itself rather than with a NOT NULL clause, so we only handle
  // DEFAULT / MATERIALIZED here.
  if (
    col.constraint?.defaultValue !== undefined &&
    col.constraint?.defaultValue !== null
  ) {
    tokens.push("DEFAULT", driver.escapeValue(col.constraint.defaultValue));
  } else if (col.constraint?.defaultExpression) {
    tokens.push("DEFAULT", col.constraint.defaultExpression);
  }

  if (col.constraint?.generatedExpression) {
    // ClickHouse has MATERIALIZED / ALIAS / EPHEMERAL instead of
    // GENERATED ALWAYS — MATERIALIZED is the closest analog.
    tokens.push("MATERIALIZED", col.constraint.generatedExpression);
  }

  return tokens.join(" ");
}

// https://clickhouse.com/docs/en/sql-reference/statements/create/table
// https://clickhouse.com/docs/en/sql-reference/statements/alter
export function generateClickHouseSchemaChange(
  driver: BaseDriver,
  change: DatabaseTableSchemaChange
): string[] {
  const isCreateScript = !change.name.old;
  const schemaName = change.schemaName ?? "default";

  if (isCreateScript) {
    const columnLines: string[] = [];
    const primaryColumns: string[] = [];

    for (const col of change.columns) {
      if (!col.new) continue;
      columnLines.push(generateCreateColumn(driver, col.new));
      if (col.new.constraint?.primaryKey || col.new.pk) {
        primaryColumns.push(col.new.name);
      }
    }

    // Pick up table-level PK constraints too
    for (const con of change.constraints) {
      if (con.new?.primaryKey && con.new.primaryColumns) {
        for (const c of con.new.primaryColumns) {
          if (!primaryColumns.includes(c)) primaryColumns.push(c);
        }
      }
    }

    const orderBy =
      primaryColumns.length > 0
        ? `(${primaryColumns.map((c) => driver.escapeId(c)).join(", ")})`
        : "tuple()";

    const hasFk = change.constraints.some((c) => c.new?.foreignKey);
    const warnings = hasFk
      ? "-- NOTE: ClickHouse MergeTree does not support FOREIGN KEY constraints; they were skipped.\n"
      : "";

    return [
      `${warnings}CREATE TABLE ${driver.escapeId(schemaName)}.${driver.escapeId(
        change.name.new || "no_table_name"
      )} (\n${columnLines.map((l) => "  " + l).join(",\n")}\n) ENGINE = MergeTree()\nORDER BY ${orderBy}`,
    ];
  }

  // ALTER path
  const prefix = `ALTER TABLE ${driver.escapeId(schemaName)}.${driver.escapeId(
    change.name.old ?? ""
  )} `;
  const lines: string[] = [];

  for (const col of change.columns) {
    if (col.new === null && col.old) {
      lines.push(`DROP COLUMN ${driver.escapeId(col.old.name)}`);
    } else if (col.old === null && col.new) {
      lines.push(`ADD COLUMN ${generateCreateColumn(driver, col.new)}`);
    } else if (col.old && col.new) {
      if (col.old.name !== col.new.name) {
        lines.push(
          `RENAME COLUMN ${driver.escapeId(col.old.name)} TO ${driver.escapeId(col.new.name)}`
        );
      }
      if (!isEqual(omit(col.old, ["name"]), omit(col.new, ["name"]))) {
        lines.push(
          `MODIFY COLUMN ${driver.escapeId(col.new.name)} ${col.new.type}`
        );
      }
    }
  }

  const statements = lines.map((l) => prefix + l);

  if (change.name.new && change.name.new !== change.name.old) {
    statements.push(
      `RENAME TABLE ${driver.escapeId(schemaName)}.${driver.escapeId(
        change.name.old ?? ""
      )} TO ${driver.escapeId(schemaName)}.${driver.escapeId(change.name.new)}`
    );
  }

  return statements;
}

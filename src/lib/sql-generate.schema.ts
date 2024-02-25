import {
  DatabaseTableColumnChange,
  DatabaseTableSchemaChange,
} from "@/components/schema-editor";
import { escapeIdentity, escapeSqlValue } from "./sql-helper";
import deepEqual from "deep-equal";
import { DatabaseTableColumn } from "@/drivers/DatabaseDriver";

export function checkSchemaColumnChange(change: DatabaseTableColumnChange) {
  return !deepEqual(change.old, change.new);
}

export function checkSchemaChange(change: DatabaseTableSchemaChange) {
  if (change.name.new !== change.name.old) return true;

  for (const col of change.columns) {
    if (checkSchemaColumnChange(col)) {
      return true;
    }
  }

  return false;
}

function wrapParen(str: string) {
  if (str.length >= 2 && str[0] === "(" && str[str.length - 1] === ")")
    return str;
  return "(" + str + ")";
}

function geneateCreateColumn(col: DatabaseTableColumn): string {
  const tokens: string[] = [escapeIdentity(col.name), col.type];

  if (col.constraint?.primaryKey) {
    tokens.push(
      [
        "PRIMARY KEY",
        col.constraint.primaryKeyOrder,
        col.constraint.primaryKeyConflict
          ? `ON CONFLICT ${col.constraint.primaryKeyConflict}`
          : undefined,
        col.constraint.autoIncrement ? "AUTOINCREMENT" : undefined,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  if (col.constraint?.unique) {
    tokens.push(
      [
        "UNIQUE",
        col.constraint.uniqueConflict
          ? `ON CONFLICT ${col.constraint.uniqueConflict}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  if (col.constraint?.notNull) {
    tokens.push(
      [
        "NOT NULL",
        col.constraint.notNullConflict
          ? `ON CONFLICT ${col.constraint.notNullConflict}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  if (col.constraint?.defaultValue) {
    tokens.push(
      ["DEFAULT", escapeSqlValue(col.constraint.defaultValue)].join(" ")
    );
  }

  if (col.constraint?.defaultExpression) {
    tokens.push(
      ["DEFAULT", wrapParen(col.constraint.defaultExpression)].join(" ")
    );
  }

  if (col.constraint?.generatedExpression) {
    tokens.push(
      [
        "GENERATED ALWAYS AS",
        wrapParen(col.constraint.generatedExpression),
        col.constraint.generatedType,
      ].join(" ")
    );
  }

  if (col.constraint?.checkExpression) {
    tokens.push("CHECK " + wrapParen(col.constraint.checkExpression));
  }

  const foreignTableName = col.constraint?.foreignKey?.foreignTableName;
  const foreignColumnName = (col.constraint?.foreignKey?.foreignColumns ?? [
    undefined,
  ])[0];

  if (foreignTableName && foreignColumnName) {
    tokens.push(
      [
        "REFERENCES",
        escapeIdentity(foreignTableName) +
          `(${escapeIdentity(foreignColumnName)})`,
      ].join(" ")
    );
  }

  return tokens.join(" ");
}

export default function generateSqlSchemaChange(
  change: DatabaseTableSchemaChange
): string[] {
  const isCreateScript = !change.name.old;

  const lines = [];

  for (const col of change.columns) {
    if (col.new === null) lines.push(`DROP COLUMN ${col.old?.name}`);
    else if (col.old == null) {
      if (isCreateScript) {
        lines.push(geneateCreateColumn(col.new));
      } else {
        lines.push("ADD " + geneateCreateColumn(col.new));
      }
    }
  }

  if (!isCreateScript) {
    if (change.name.new !== change.name.old) {
      lines.push("RENAME TO " + escapeIdentity(change.name.new ?? ""));
    }
  }

  if (isCreateScript) {
    return [
      `CREATE TABLE ${escapeIdentity(
        change.name.new || "no_table_name"
      )}(\n${lines.map((line) => "  " + line).join(",\n")}\n)`,
    ];
  } else {
    const alter = `ALTER TABLE ${escapeIdentity(change.name.old ?? "")} `;
    return lines.map((line) => alter + line);
  }
}

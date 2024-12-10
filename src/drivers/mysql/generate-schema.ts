import {
  BaseDriver,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableSchemaChange,
} from "../base-driver";

import { omit, isEqual } from "lodash";

function wrapParen(str: string) {
  if (str.length >= 2 && str.startsWith("(") && str.endsWith(")")) return str;
  return "(" + str + ")";
}

function generateCreateColumn(
  driver: BaseDriver,
  col: DatabaseTableColumn
): string {
  const tokens: string[] = [driver.escapeId(col.name), col.type];

  if (col.constraint?.primaryKey) {
    tokens.push(
      [
        "PRIMARY KEY",
        col.constraint.primaryKeyOrder,
        col.constraint.primaryKeyConflict
          ? `ON CONFLICT ${col.constraint.primaryKeyConflict}`
          : undefined,
        col.constraint.autoIncrement ? "AUTO_INCREMENT" : undefined,
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
      ["DEFAULT", driver.escapeValue(col.constraint.defaultValue)].join(" ")
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
        driver.escapeId(foreignTableName) +
          `(${driver.escapeId(foreignColumnName)})`,
      ].join(" ")
    );
  }

  return tokens.join(" ");
}

function generateConstraintScript(
  driver: BaseDriver,
  con: DatabaseTableColumnConstraint
) {
  if (con.primaryKey) {
    return `PRIMARY KEY (${con.primaryColumns?.map(driver.escapeId).join(", ")})`;
  } else if (con.unique) {
    return `UNIQUE (${con.uniqueColumns?.map(driver.escapeId).join(", ")})`;
  } else if (con.checkExpression !== undefined) {
    return `CHECK (${con.checkExpression})`;
  } else if (con.foreignKey) {
    return (
      `FOREIGN KEY (${con.foreignKey.columns?.map(driver.escapeId).join(", ")}) ` +
      `REFERENCES ${driver.escapeId(con.foreignKey.foreignTableName ?? "")} ` +
      `(${con.foreignKey.foreignColumns?.map(driver.escapeId).join(", ")})`
    );
  }
}

// https://dev.mysql.com/doc/refman/8.4/en/create-table.html
export function generateMySqlSchemaChange(
  driver: BaseDriver,
  change: DatabaseTableSchemaChange
): string[] {
  const isCreateScript = !change.name.old;

  const lines = [];

  for (const col of change.columns) {
    if (col.new === null) lines.push(`DROP COLUMN ${col.old?.name}`);
    else if (col.old === null) {
      if (isCreateScript) {
        lines.push(generateCreateColumn(driver, col.new));
      } else {
        lines.push("ADD " + generateCreateColumn(driver, col.new));
      }
    } else {
      // check if there is rename
      if (col.new.name !== col.old.name) {
        lines.push(
          `RENAME COLUMN ${driver.escapeId(col.old.name)} TO ${driver.escapeId(
            col.new.name
          )}`
        );
      }

      console.log(col.old, col.new);

      // check if there is any changed except name
      if (!isEqual(omit(col.old, ["name"]), omit(col.new, ["name"]))) {
        lines.push(`MODIFY COLUMN ${generateCreateColumn(driver, col.new)}`);
      }
    }
  }

  for (const con of change.constraints) {
    if (con.new) {
      if (isCreateScript) {
        lines.push(generateConstraintScript(driver, con.new));
      }
    }
  }

  if (!isCreateScript) {
    if (change.name.new !== change.name.old) {
      lines.push(
        `RENAME TO ${driver.escapeId(change.schemaName ?? "main")}.${driver.escapeId(change.name.new ?? "")}`
      );
    }
  }

  if (isCreateScript) {
    return [
      `CREATE TABLE ${driver.escapeId(change.schemaName ?? "main")}.${driver.escapeId(
        change.name.new || "no_table_name"
      )}(\n${lines.map((line) => "  " + line).join(",\n")}\n)`,
    ];
  } else {
    const alter = `ALTER TABLE ${driver.escapeId(change.schemaName ?? "main")}.${driver.escapeId(change.name.old ?? "")} `;
    return lines.map((line) => alter + line);
  }
}

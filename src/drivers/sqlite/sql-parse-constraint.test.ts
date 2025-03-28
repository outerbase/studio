import type { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { tokenizeSql } from "@outerbase/sdk-transform";
import { CursorV2, parseColumnConstraint } from "./sql-parse-table";

// Parse column constraint
function pcc(sql: string) {
  return parseColumnConstraint(
    "main",
    new CursorV2(tokenizeSql(sql, "sqlite"))
  );
}

describe("parse column constraint", () => {
  test("constraint this_is_primary_key primary key autoincrement", () => {
    expect(
      pcc("constraint this_is_primary_key primary key autoincrement")
    ).toEqual({
      name: "this_is_primary_key",
      primaryKey: true,
      autoIncrement: true,
    } as DatabaseTableColumnConstraint);
  });
  test("primary key with multiple columns", () => {
    expect(pcc("primary key(first_name, last_name)")).toEqual({
      primaryKey: true,
      autoIncrement: false,
      primaryColumns: ["first_name", "last_name"],
    } as DatabaseTableColumnConstraint);
  });

  test("primary key with conflict clause and not null", () => {
    expect(pcc("primary key on conflict rollback not null")).toEqual({
      primaryKey: true,
      autoIncrement: false,
      primaryKeyConflict: "ROLLBACK",
      notNull: true,
    } as DatabaseTableColumnConstraint);
  });

  test("not null before primary key with conflict clause", () => {
    expect(pcc("not null primary key on conflict rollback")).toEqual({
      primaryKey: true,
      autoIncrement: false,
      primaryKeyConflict: "ROLLBACK",
      notNull: true,
    } as DatabaseTableColumnConstraint);
  });

  test("unique with conflict clause", () => {
    expect(pcc("unique on conflict rollback")).toEqual({
      unique: true,
      uniqueConflict: "ROLLBACK",
    } as DatabaseTableColumnConstraint);
  });

  test("default with string value", () => {
    expect(pcc(`default 'Visal'`)).toEqual({
      defaultValue: "Visal",
    } as DatabaseTableColumnConstraint);
  });

  test("default with negative number", () => {
    expect(pcc(`default -5`)).toEqual({
      defaultValue: -5,
    } as DatabaseTableColumnConstraint);
  });

  test("default with positive decimal", () => {
    expect(pcc(`default +5.5`)).toEqual({
      defaultValue: 5.5,
    } as DatabaseTableColumnConstraint);
  });

  test("default with decimal", () => {
    expect(pcc(`default 5.5`)).toEqual({
      defaultValue: 5.5,
    } as DatabaseTableColumnConstraint);
  });

  test("default with function", () => {
    expect(pcc(`default current_timestamp`)).toEqual({
      defaultExpression: "current_timestamp",
    } as DatabaseTableColumnConstraint);
  });

  test("default with expression", () => {
    expect(pcc(`default (round(julianday('now')))`)).toEqual({
      defaultExpression: `round(julianday('now'))`,
    } as DatabaseTableColumnConstraint);
  });

  test("foreign key with references", () => {
    expect(
      pcc(`foreign key ("user_id") references "users" on delete cascade ("id")`)
    ).toEqual({
      foreignKey: {
        foreignSchemaName: "main",
        columns: ["user_id"],
        foreignTableName: "users",
        foreignColumns: ["id"],
      },
    } as DatabaseTableColumnConstraint);
  });

  test("references shorthand", () => {
    expect(pcc(`references "users" on delete cascade ("id")`)).toEqual({
      foreignKey: {
        foreignSchemaName: "main",
        foreignTableName: "users",
        foreignColumns: ["id"],
      },
    } as DatabaseTableColumnConstraint);
  });

  test("generated column", () => {
    expect(pcc(`generated always as (price * qty) virtual`)).toEqual({
      generatedExpression: "price * qty",
      generatedType: "VIRTUAL",
    } as DatabaseTableColumnConstraint);
  });
});

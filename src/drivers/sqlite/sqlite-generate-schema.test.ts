import { parseCreateTableScript } from "./sql-parse-table";
import { produce } from "immer";
import generateSqlSchemaChange from "./sqlite-generate-schema";
import { createTableSchemaDraft } from "@/lib/sql/sql-generate.schema";

function c(sql: string) {
  return createTableSchemaDraft("main", parseCreateTableScript("main", sql));
}

describe("sqlite - generate table schema", () => {
  test("rename column name", () => {
    let t = c(`create table testing(id integer, qty integer, amount real)`);
    t = produce(t, (draft) => {
      if (draft.columns[1]?.new) {
        draft.columns[1].new.name = "quantity";
      }
    });

    const code = generateSqlSchemaChange(t);
    expect(code).toEqual([
      `ALTER TABLE "main"."testing" RENAME COLUMN "qty" TO "quantity"`,
    ]);
  });

  test("rename column name and change some data type", () => {
    let t = c(`create table testing(id integer, qty integer, amount real)`);
    t = produce(t, (draft) => {
      if (draft.columns[1]?.new) {
        draft.columns[1].new.name = "quantity";
        draft.columns[1].new.type = "REAL";
      }

      if (draft.columns[2]?.new) {
        draft.columns[2].new.name = "amt";
      }
    });

    const code = generateSqlSchemaChange(t);
    expect(code).toEqual([
      `ALTER TABLE "main"."testing" RENAME COLUMN "qty" TO "quantity"`,
      `ALTER TABLE "main"."testing" ALTER COLUMN "quantity" TO "quantity" REAL`,
      `ALTER TABLE "main"."testing" RENAME COLUMN "amount" TO "amt"`,
    ]);
  });
});

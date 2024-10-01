import { createTableSchemaDraft } from "@/components/lib/sql-generate.schema";
import { parseCreateTableScript } from "./sql-parse-table";
import { produce } from "immer";
import generateSqlSchemaChange from "./sqlite-generate-schema";

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
});

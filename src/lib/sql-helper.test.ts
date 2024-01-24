import { exportRowsToSqlInsert } from "./export-helper";
import { escapeIdentity, escapeSqlString } from "./sql-helper";

test("escape sql string", () => {
  expect(escapeSqlString("i'm testing")).toBe("'i''m testing'");
  expect(escapeSqlString("There are 'two' single quote")).toBe(
    "'There are ''two'' single quote'"
  );
});

test("escape sql identity", () => {
  expect(escapeIdentity(`col"name`)).toBe(`"col""name"`);
});

test("generate export insert from rows", () => {
  expect(
    exportRowsToSqlInsert(
      "users",
      ["id", "name", "age"],
      [
        [undefined, "Visal", 35],
        [2, "Turso", null],
      ]
    )
  ).toBe(
    [
      `INSERT INTO "users"("id", "name", "age") VALUES(DEFAULT, 'Visal', 35);`,
      `INSERT INTO "users"("id", "name", "age") VALUES(2, 'Turso', NULL);`,
    ].join("\r\n")
  );
});

import { escapeSqlString } from "./sql-helper";

test("escape sql string", () => {
  expect(escapeSqlString("i'm testing")).toBe("'i''m testing'");
  expect(escapeSqlString("There are 'two' single quote")).toBe(
    "'There are ''two'' single quote'"
  );
});

import { TableColumnDataType } from "@/app/(components)/OptimizeTable";
import { exportRowsToSqlInsert } from "./export-helper";
import {
  convertSqliteType,
  escapeIdentity,
  escapeSqlString,
  generateInsertStatement,
} from "./sql-helper";

describe("Escape SQL", () => {
  it("escape sql string", () => {
    expect(escapeSqlString("i'm testing")).toBe("'i''m testing'");
    expect(escapeSqlString("There are 'two' single quote")).toBe(
      "'There are ''two'' single quote'"
    );
  });

  it("escape sql identity", () => {
    expect(escapeIdentity(`col"name`)).toBe(`"col""name"`);
  });
});

describe("Generate SQL Statement", () => {
  test("Generate export rows to SQL statements", () => {
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

  it("Generate insert statement from object", () => {
    expect(
      generateInsertStatement("users", {
        name: "Visal",
        age: 50,
        title: "O'reilly",
      })
    ).toBe(
      `INSERT INTO "users"("name", "age", "title") VALUES('Visal', 50, 'O''reilly');`
    );
  });
});

describe("Mapping sqlite column type to our table type", () => {
  const integerType = [
    "INT",
    "INTEGER",
    "TINYINT",
    "SMALLINT",
    "MEDIUMINT",
    "BIGINT",
    "UNSIGNED BIG INT",
    "INT2",
    "INT8",
  ];

  for (const type of integerType) {
    it(`${type} column type should be INTEGER`, () => {
      expect(convertSqliteType(type)).toBe(TableColumnDataType.INTEGER);
    });
  }

  const textType = [
    "CHARACTER(20)",
    "VARCHAR(255)",
    "VARYING CHARACTER(255)",
    "NCHAR(55)",
    "NATIVE CHARACTER(70)",
    "NVARCHAR(100)",
    "TEXT",
    "CLOB",
  ];

  for (const type of textType) {
    it(`${type} column type should be TEXT`, () =>
      expect(convertSqliteType(type)).toBe(TableColumnDataType.TEXT));
  }

  expect(convertSqliteType("BLOB")).toBe(TableColumnDataType.BLOB);

  const realType = ["REAL", "DOUBLE", "DOUBLE PRECISION", "FLOAT"];
  for (const type of realType) {
    it(`${type} column should be REAL`, () =>
      expect(convertSqliteType(type)).toBe(TableColumnDataType.REAL));
  }
});

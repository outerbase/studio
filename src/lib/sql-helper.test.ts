import { TableColumnDataType } from "@/app/(components)/OptimizeTable";
import { exportRowsToSqlInsert } from "./export-helper";
import {
  convertSqliteType,
  escapeIdentity,
  escapeSqlString,
} from "./sql-helper";

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

test("convert to correct type", () => {
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
    expect(convertSqliteType(type)).toBe(TableColumnDataType.INTEGER);
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
    expect(convertSqliteType(type)).toBe(TableColumnDataType.TEXT);
  }

  expect(convertSqliteType("BLOB")).toBe(TableColumnDataType.BLOB);

  const realType = ["REAL", "DOUBLE", "DOUBLE PRECISION", "FLOAT"];
  for (const type of realType) {
    expect(convertSqliteType(type)).toBe(TableColumnDataType.REAL);
  }
});

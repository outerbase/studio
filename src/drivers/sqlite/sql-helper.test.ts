import { ColumnType } from "@outerbase/sdk-transform";
import {
  convertSqliteType,
  escapeIdentity,
  escapeSqlBinary,
  escapeSqlString,
  escapeSqlValue,
  unescapeIdentity,
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

  it("escape blob", () => {
    const buffer = new Uint8Array([
      93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146,
    ]).buffer;

    expect(escapeSqlValue(buffer)).toBe(`x'5D41402ABC4B2A76B9719D911017C592'`);
    expect(escapeSqlBinary(buffer)).toBe(`x'5D41402ABC4B2A76B9719D911017C592'`);
  });

  it("unescape identity", () => {
    expect(unescapeIdentity(`"users"`)).toBe("users");
    expect(unescapeIdentity(`"us""ers"`)).toBe(`us"ers`);
    expect(unescapeIdentity(`[users]`)).toBe(`users`);
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
      expect(convertSqliteType(type)).toBe(ColumnType.INTEGER);
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
    it(`${type} column type should be TEXT`, () => {
      expect(convertSqliteType(type)).toBe(ColumnType.TEXT);
    });
  }

  it("BLOB column type", () => {
    expect(convertSqliteType("BLOB")).toBe(ColumnType.BLOB);
  });

  const realType = ["REAL", "DOUBLE", "DOUBLE PRECISION", "FLOAT"];
  for (const type of realType) {
    it(`${type} column should be REAL`, () => {
      expect(convertSqliteType(type)).toBe(ColumnType.REAL);
    });
  }
});

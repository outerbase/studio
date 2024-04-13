import { TableColumnDataType } from "@/drivers/base-driver";
import { exportRowsToSqlInsert } from "./export-helper";
import {
  convertSqliteType,
  escapeIdentity,
  escapeSqlBinary,
  escapeSqlString,
  escapeSqlValue,
  generateDeleteStatement,
  generateInsertStatement,
  generateUpdateStatement,
  selectStatementFromPosition,
  unescapeIdentity,
} from "./sql-helper";
import { identify } from "sql-query-identifier";

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

  it("Generate update statement", () => {
    expect(
      generateUpdateStatement(
        "users",
        {
          id: 5,
        },
        { age: 50, title: "O'reilly" }
      )
    ).toBe(
      `UPDATE "users" SET "age" = 50, "title" = 'O''reilly' WHERE "id" = 5;`
    );
  });

  it("Generate delete statement", () => {
    expect(generateDeleteStatement("users", { id: 5 })).toBe(
      `DELETE FROM "users" WHERE "id" = 5;`
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

  it("BLOB column type", () => {
    expect(convertSqliteType("BLOB")).toBe(TableColumnDataType.BLOB);
  });

  const realType = ["REAL", "DOUBLE", "DOUBLE PRECISION", "FLOAT"];
  for (const type of realType) {
    it(`${type} column should be REAL`, () =>
      expect(convertSqliteType(type)).toBe(TableColumnDataType.REAL));
  }
});

function ss(sql: string) {
  const pos = sql.indexOf("|");
  const statements = identify(sql.replace("|", ""));
  return selectStatementFromPosition(statements, pos);
}

describe("Select current query", () => {
  it("select current query", () => {
    expect(ss("select * from |t1; update t1 set name='visal';")?.text).toBe(
      "select * from t1;"
    );

    expect(ss("select * from t1|; update t1 set name='visal';")?.text).toBe(
      "select * from t1;"
    );

    expect(ss("select * from t1;| update t1 set name='visal';")?.text).toBe(
      "select * from t1;"
    );

    expect(ss("select * from t1; update| t1 set name='visal';")?.text).toBe(
      "update t1 set name='visal';"
    );
  });
});

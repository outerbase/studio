import { tokenizeSql } from "./tokenizer";

test("Select simple query", () => {
  const sql = "SELECT * FROM customers";
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Check identifers", () => {
  const sql = `SELECT customer.name, [customer].[first name], "customer"."last name"
  FROM customers WHERE customers.name = 'John Doe'`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customer" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "name" },
    { type: "PUNCTUATION", value: "," },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "[customer]" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "[first name]" },
    { type: "PUNCTUATION", value: "," },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"customer"' },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: '"last name"' },
    { type: "WHITESPACE", value: "\n  " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'John Doe'" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Back tick identifier", () => {
  const sql = "SELECT `customer`.`name` FROM `customers`";
  const tokens = tokenizeSql(sql, "mysql");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "`customer`" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "`name`" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "`customers`" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Invalid identifier", () => {
  const sql = `SELECT [customer].[fist
  name] FROM "customers"`;
  const tokens = tokenizeSql(sql, "mysql");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "[customer]" },
    { type: "PUNCTUATION", value: "." },
    { type: "UNKNOWN", value: "[" },
    { type: "IDENTIFIER", value: "fist" },
    { type: "WHITESPACE", value: "\n  " },
    { type: "IDENTIFIER", value: "name" },
    { type: "UNKNOWN", value: "]" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"customers"' },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("String literal", () => {
  const sql = `SELECT 'Hello' AS "greeting" FROM "customers" WHERE "name" = 'John Doe'`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'Hello'" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "AS" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"greeting"' },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"customers"' },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"name"' },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'John Doe'" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("number literal", () => {
  const sql = `SELECT 123.45 FROM "customers" WHERE "age" = 30`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "NUMBER", value: "123.45" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"customers"' },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"age"' },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "NUMBER", value: "30" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Placeholder", () => {
  const sql = `SELECT * FROM customers WHERE name = :name`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "PLACEHOLDER", value: ":name" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Placehoder witch have sign : in string and comment", () => {
  const sql = `/*
  SELECT * FROM customers WHERE name = ':name' AND "code" =:code -- only :code is a placeholder
  */
  SELECT * FROM customers WHERE name = ':name' AND "code" =:code -- only :code is a placeholder`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    {
      type: "COMMENT",
      value:
        "/*\n" +
        `  SELECT * FROM customers WHERE name = ':name' AND "code" =:code -- only :code is a placeholder\n` +
        "  */",
    },
    { type: "WHITESPACE", value: "\n  " },
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "':name'" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "AND" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: '"code"' },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "PLACEHOLDER", value: ":code" },
    { type: "WHITESPACE", value: " " },
    { type: "COMMENT", value: "-- only :code is a placeholder" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Mysql comment", () => {
  const sql = `SELECT * FROM customers WHERE name = 'John Doe'
  # this is a comment
  -- this is also comment
  /* this is a block comment */
  `;
  const tokens = tokenizeSql(sql, "mysql");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'John Doe'" },
    { type: "WHITESPACE", value: "\n  " },
    { type: "COMMENT", value: "# this is a comment" },
    { type: "WHITESPACE", value: "\n  " },
    { type: "COMMENT", value: "-- this is also comment" },
    { type: "WHITESPACE", value: "\n  " },
    { type: "COMMENT", value: "/* this is a block comment */" },
    { type: "WHITESPACE", value: "\n  " },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("Error on invalid # comment from non-mysql", () => {
  const sql = `SELECT * FROM customers WHERE name = 'John Doe' # this is a comment`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'John Doe'" },
    { type: "WHITESPACE", value: " " },
    { type: "UNKNOWN", value: "#" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "this" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "is" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "a" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "comment" },
  ]);
});

test("Operator and punctuation", () => {
  const sql = `SELECT * FROM customers WHERE name = 'John Doe' AND age > 30;`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "name" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "STRING", value: "'John Doe'" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "AND" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "age" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: ">" },
    { type: "WHITESPACE", value: " " },
    { type: "NUMBER", value: "30" },
    { type: "PUNCTUATION", value: ";" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});
test("Keyword WITH and subquery", () => {
  const sql = `WITH subquery AS (SELECT * FROM customers) SELECT * FROM subquery`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "WITH" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "subquery" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "AS" },
    { type: "WHITESPACE", value: " " },
    { type: "PUNCTUATION", value: "(" },
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "PUNCTUATION", value: ")" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "subquery" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("IN clause", () => {
  const sql = `SELECT * FROM customers WHERE age IN (25, 30, 35)`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "*" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "WHERE" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "age" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "IN" },
    { type: "WHITESPACE", value: " " },
    { type: "PUNCTUATION", value: "(" },
    { type: "NUMBER", value: "25" },
    { type: "PUNCTUATION", value: "," },
    { type: "WHITESPACE", value: " " },
    { type: "NUMBER", value: "30" },
    { type: "PUNCTUATION", value: "," },
    { type: "WHITESPACE", value: " " },
    { type: "NUMBER", value: "35" },
    { type: "PUNCTUATION", value: ")" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

test("INNER JOIN", () => {
  const sql = `SELECT customers.name, orders.id FROM customers INNER JOIN orders ON customers.id = orders.customer_id`;
  const tokens = tokenizeSql(sql, "sqlite");
  expect(tokens).toEqual([
    { type: "IDENTIFIER", value: "SELECT" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "name" },
    { type: "PUNCTUATION", value: "," },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "orders" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "id" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "FROM" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "INNER" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "JOIN" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "orders" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "ON" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "customers" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "id" },
    { type: "WHITESPACE", value: " " },
    { type: "OPERATOR", value: "=" },
    { type: "WHITESPACE", value: " " },
    { type: "IDENTIFIER", value: "orders" },
    { type: "PUNCTUATION", value: "." },
    { type: "IDENTIFIER", value: "customer_id" },
  ]);
  expect(tokens.map((t) => t.value).join("")).toBe(sql);
});

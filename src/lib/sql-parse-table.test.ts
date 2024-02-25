import {
  DatabaseTableColumnConstraint,
  DatabaseTableSchema,
} from "@/drivers/DatabaseDriver";
import {
  buildSyntaxCursor,
  parseColumnConstraint,
  parseCreateTableScript,
} from "./sql-parse-table";

// Parse column constraint
function pcc(sql: string) {
  return parseColumnConstraint(buildSyntaxCursor(sql));
}

function p(sql: string) {
  return parseCreateTableScript(sql);
}

it("parse column constraint", () => {
  expect(
    pcc("constraint this_is_primary_key primary key autoincrement")
  ).toEqual({
    name: "this_is_primary_key",
    primaryKey: true,
    autoIncrement: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("primary key(first_name, last_name)")).toEqual({
    primaryKey: true,
    autoIncrement: false,
    primaryColumns: ["first_name", "last_name"],
  } as DatabaseTableColumnConstraint);

  expect(pcc("primary key on conflict rollback not null")).toEqual({
    primaryKey: true,
    autoIncrement: false,
    primaryKeyConflict: "ROLLBACK",
    notNull: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("not null primary key on conflict rollback")).toEqual({
    primaryKey: true,
    autoIncrement: false,
    primaryKeyConflict: "ROLLBACK",
    notNull: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("unique on conflict rollback")).toEqual({
    unique: true,
    uniqueConflict: "ROLLBACK",
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default 'Visal'`)).toEqual({
    defaultValue: "Visal",
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default -5`)).toEqual({
    defaultValue: -5,
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default +5.5`)).toEqual({
    defaultValue: 5.5,
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default 5.5`)).toEqual({
    defaultValue: 5.5,
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default current_timestamp`)).toEqual({
    defaultExpression: "current_timestamp",
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default (round(julianday('now'))`)).toEqual({
    defaultExpression: `(round(julianday('now'))`,
  } as DatabaseTableColumnConstraint);

  expect(
    pcc(`foreign key ("user_id") references "users" on delete cascade ("id")`)
  ).toEqual({
    foreignKey: {
      columns: ["user_id"],
      foreignTableName: "users",
      foreignColumns: ["id"],
    },
  } as DatabaseTableColumnConstraint);

  expect(pcc(`references "users" on delete cascade ("id")`)).toEqual({
    foreignKey: {
      foreignTableName: "users",
      foreignColumns: ["id"],
    },
  } as DatabaseTableColumnConstraint);

  expect(pcc(`generated always as (price * qty) virtual`)).toEqual({
    generatedExpression: "(price * qty)",
    generatedType: "VIRTUAL",
  } as DatabaseTableColumnConstraint);
});

it("parse create table", () => {
  const sql = `create table "invoice_detail"(
    id integer primary key autoincrement,
    product_id integer references product(id),
    price real not null,
    qty real,
    note varchar(255),
    total real generated always as (price * qty) virtual
  );`;

  expect(p(sql)).toEqual({
    tableName: "invoice_detail",
    pk: ["id"],
    autoIncrement: true,
    constraints: [],
    columns: [
      {
        name: "id",
        type: "integer",
        pk: true,
        constraint: {
          primaryKey: true,
          autoIncrement: true,
        },
      },
      {
        name: "product_id",
        type: "integer",
        constraint: {
          foreignKey: {
            foreignTableName: "product",
            foreignColumns: ["id"],
          },
        },
      },
      {
        name: "price",
        type: "real",
        constraint: {
          notNull: true,
        },
      },
      {
        name: "qty",
        type: "real",
      },
      {
        name: "note",
        type: "varchar(255)",
      },
      {
        name: "total",
        type: "real",
        constraint: {
          generatedExpression: "(price * qty)",
          generatedType: "VIRTUAL",
        },
      },
    ],
  } as DatabaseTableSchema);
});

it("parse create table with table constraints", () => {
  const sql = `create table "users"(
    first_name varchar,
    last_name varchar,
    category_id integer,
    primary key(first_name, last_name),
    foreign key(category_id) references category(id)
  );`;

  expect(p(sql)).toEqual({
    tableName: "users",
    pk: ["first_name", "last_name"],
    autoIncrement: false,
    constraints: [
      {
        primaryKey: true,
        autoIncrement: false,
        primaryColumns: ["first_name", "last_name"],
      },
      {
        foreignKey: {
          columns: ["category_id"],
          foreignColumns: ["id"],
          foreignTableName: "category",
        },
      },
    ],
    columns: [
      {
        name: "first_name",
        type: "varchar",
        pk: true,
      },
      {
        name: "last_name",
        type: "varchar",
        pk: true,
      },
      {
        name: "category_id",
        type: "integer",
      },
    ],
  } as DatabaseTableSchema);
});

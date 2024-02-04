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

it("parse column constraint", () => {
  expect(
    pcc("constraint this_is_primary_key primary key autoincrement")
  ).toEqual({
    name: "this_is_primary_key",
    primaryKey: true,
    autoIncrement: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("primary key on conflict rollback not null")).toEqual({
    name: "",
    primaryKey: true,
    autoIncrement: false,
    primaryKeyConflict: "ROLLBACK",
    notNull: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("not null primary key on conflict rollback")).toEqual({
    name: "",
    primaryKey: true,
    autoIncrement: false,
    primaryKeyConflict: "ROLLBACK",
    notNull: true,
  } as DatabaseTableColumnConstraint);

  expect(pcc("unique on conflict rollback")).toEqual({
    name: "",
    unique: true,
    uniqueConflict: "ROLLBACK",
  } as DatabaseTableColumnConstraint);

  expect(pcc(`default 'Visal'`)).toEqual({
    name: "",
    default: "Visal",
  });
});

// it("parse create table with virtual column", () => {
//   const result = parseCreateTableScript(`CREATE TABLE invoice(
//     id integer primary key autoincrement not null,
//     name text,
//     qty int,
//     price real,
//     total real generated always as (qty * price)
//     )`);

//   console.log(result);

//   expect(result).toEqual({
//     tableName: "invoice",
//     columns: [
//       {
//         name: "id",
//         pk: true,
//         nullable: false,
//         type: "integer",
//       },
//       {
//         name: "name",
//         pk: false,
//         nullable: true,
//         type: "text",
//       },
//       {
//         name: "qty",
//         pk: false,
//         nullable: true,

//         type: "int",
//       },
//       {
//         name: "price",
//         pk: false,
//         nullable: true,
//         type: "real",
//       },
//       {
//         name: "total",
//         pk: false,
//         nullable: true,
//         type: "real",
//       },
//     ],
//     pk: ["id"],
//     autoIncrement: true,
//   } as DatabaseTableSchema);
// });

import { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import {
  LucideArrowUpRight,
  LucideCheck,
  LucideFingerprint,
  LucideKeySquare,
  LucideMoveHorizontal,
} from "lucide-react";
import { DatabaseTableConstraintChange } from ".";
import TableCombobox from "../table-combobox/TableCombobox";

function ColumnCheck({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <tr className="text-sm">
      <td className="border p-2">
        <LucideCheck className="w-4 h-4 inline mr-2" /> Check
      </td>
      <td className="border" colSpan={2}>
        <input
          value={constraint.checkExpression}
          readOnly
          className="font-mono p-2 w-full outline-none"
        />
      </td>
    </tr>
  );
}

function ColumnForeignKey({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <tr className="text-sm">
      <td className="border p-2">
        <LucideArrowUpRight className="w-4 h-4 inline mr-2" />
        Foreign Key
      </td>
      <td className="border">
        <TableCombobox
          borderless
          disabled
          onChange={() => {}}
          value={constraint.foreignKey?.foreignTableName}
        />
      </td>
      <td className="border">
        <div className="p-1 px-2 flex gap-2">
          {(constraint.foreignKey?.foreignColumns ?? []).map(
            (columnName, idx) => {
              const thisColumnName = (constraint.foreignKey?.columns ?? [])[
                idx
              ];

              return (
                <div
                  key={idx}
                  className="p-1 px-2 bg-secondary flex items-center rounded"
                >
                  {thisColumnName}{" "}
                  <LucideMoveHorizontal className="mx-2 w-4 h-4" />
                  {columnName}
                </div>
              );
            }
          )}
        </div>
      </td>
    </tr>
  );
}

function ColumnPrimaryKey({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <tr className="text-sm">
      <td className="border p-2">
        <LucideKeySquare className="w-4 h-4 inline mr-2" />
        Primary Key
      </td>
      <td className="border" colSpan={2}>
        <div className="px-2 p-1 flex gap-2">
          {(constraint.primaryColumns ?? []).map((columnName, idx) => {
            return (
              <div key={idx} className="p-1 px-2 bg-secondary rounded">
                {columnName}
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

function ColumnUnique({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <tr className="text-sm">
      <td className="border p-2">
        <LucideFingerprint className="w-4 h-4 inline mr-2" />
        Unique
      </td>
      <td className="border" colSpan={2}>
        <div className="px-2 p-1 flex gap-2">
          {(constraint.uniqueColumns ?? []).map((columnName, idx) => {
            return (
              <div key={idx} className="p-1 px-2 bg-secondary rounded">
                {columnName}
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

function ColumnItem({
  constraint,
}: Readonly<{ constraint: DatabaseTableConstraintChange }>) {
  const currentConstraint = constraint.new ?? constraint.old;

  if (!currentConstraint) return null;

  if (currentConstraint.foreignKey) {
    return <ColumnForeignKey constraint={currentConstraint} />;
  }

  if (currentConstraint.primaryKey) {
    return <ColumnPrimaryKey constraint={currentConstraint} />;
  }

  if (currentConstraint.unique) {
    return <ColumnUnique constraint={currentConstraint} />;
  }

  if (currentConstraint.checkExpression !== undefined) {
    return <ColumnCheck constraint={currentConstraint} />;
  }

  return (
    <tr>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  );
}

export default function SchemaEditorConstraintList({
  constraints,
}: Readonly<{ constraints: DatabaseTableConstraintChange[] }>) {
  const headerClassName = "text-xs p-2 text-left bg-secondary border";

  return (
    <div className="px-4 py-2">
      <table className="w-full">
        <thead>
          <tr>
            <th className={cn(headerClassName, "w-[175px]")}>Constraint</th>
            <th className={cn(headerClassName, "w-[150px]")}></th>
            <th className={headerClassName}></th>
          </tr>
        </thead>
        <tbody>
          {constraints.map((constraint, idx) => {
            return <ColumnItem key={idx} constraint={constraint} />;
          })}
        </tbody>
      </table>
    </div>
  );
}

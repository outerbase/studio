import { DatabaseTableColumnConstraint } from "@gui/drivers/base-driver";
import { cn, noop } from "@gui/lib/utils";
import {
  LucideArrowUpRight,
  LucideCheck,
  LucideFingerprint,
  LucideKeySquare,
  LucideMoveHorizontal,
  LucideShieldPlus,
  LucideTrash2,
} from "lucide-react";
import { DatabaseTableConstraintChange, DatabaseTableSchemaChange } from ".";
import TableCombobox from "../table-combobox/TableCombobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import ColumnListEditor from "../column-list-editor";
import { useColumnList } from "./column-provider";

type ConstraintChangeHandler = (
  constraint: DatabaseTableColumnConstraint
) => void;

function ColumnCheck({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <>
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
    </>
  );
}

function ColumnForeignKey({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <>
      <td className="border p-2">
        <LucideArrowUpRight className="w-4 h-4 inline mr-2" />
        Foreign Key
      </td>
      <td className="border">
        <TableCombobox
          borderless
          disabled
          onChange={noop}
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
    </>
  );
}

function ColumnPrimaryKey({
  constraint,
  onChange,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
}>) {
  const { columns } = useColumnList();

  const columnMemo = useMemo(() => {
    return [...new Set(columns.map((c) => c.new?.name ?? c.old?.name ?? ""))];
  }, [columns]);

  const onConstraintChange = useCallback(
    (newColumn: string[]) => {
      onChange({ ...constraint, primaryColumns: newColumn });
    },
    [onChange, constraint]
  );

  return (
    <>
      <td className="border p-2">
        <LucideKeySquare className="w-4 h-4 inline mr-2" />
        Primary Key
      </td>
      <td className="border" colSpan={2}>
        <div className="px-2 p-1 flex gap-2">
          <ColumnListEditor
            value={constraint.primaryColumns ?? []}
            columns={columnMemo}
            onChange={onConstraintChange}
          />
        </div>
      </td>
    </>
  );
}

function ColumnUnique({
  constraint,
}: Readonly<{ constraint: DatabaseTableColumnConstraint }>) {
  return (
    <>
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
    </>
  );
}

function RemovableConstraintItem({
  children,
  idx,
  onChange,
}: PropsWithChildren<{
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}>) {
  const onRemoveClicked = useCallback(() => {
    onChange((prev) => {
      let newConstraint = [...prev.constraints];
      const currentConstraint = newConstraint[idx];

      if (!currentConstraint?.old) {
        newConstraint = prev.constraints.filter((_, cIndex) => cIndex !== idx);
      } else if (currentConstraint) {
        currentConstraint.new = null;
      }

      return {
        ...prev,
        constraints: newConstraint,
      };
    });
  }, [onChange, idx]);

  return (
    <tr className="text-sm">
      {children}
      <td className="border">
        <button className="p-1" onClick={onRemoveClicked}>
          <LucideTrash2 className="w-4 h-4 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

function ColumnItemBody({
  idx,
  onChange,
  constraint,
}: PropsWithChildren<{
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  constraint: DatabaseTableConstraintChange;
}>) {
  const onChangeConstraint = useCallback(
    (newConstraint: DatabaseTableColumnConstraint) => {
      onChange((prev) => {
        return {
          ...prev,
          constraints: prev.constraints.map((c) => {
            if (c === constraint) {
              return { ...c, new: newConstraint };
            }
            return c;
          }),
        };
      });
    },
    [onChange, constraint]
  );

  const currentConstraint = constraint.new ?? constraint.old;
  if (!currentConstraint) return null;

  if (currentConstraint.foreignKey) {
    return <ColumnForeignKey constraint={currentConstraint} />;
  }

  if (currentConstraint.primaryKey) {
    return (
      <ColumnPrimaryKey
        constraint={currentConstraint}
        onChange={onChangeConstraint}
      />
    );
  }

  if (currentConstraint.unique) {
    return <ColumnUnique constraint={currentConstraint} />;
  }

  if (currentConstraint.checkExpression !== undefined) {
    return <ColumnCheck constraint={currentConstraint} />;
  }

  return <td colSpan={4}></td>;
}

function ColumnItem({
  constraint,
  onChange,
  idx,
}: Readonly<{
  constraint: DatabaseTableConstraintChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  idx: number;
}>) {
  return (
    <RemovableConstraintItem idx={idx} onChange={onChange}>
      <ColumnItemBody constraint={constraint} onChange={onChange} idx={idx} />
    </RemovableConstraintItem>
  );
}

export default function SchemaEditorConstraintList({
  constraints,
  onChange,
}: Readonly<{
  constraints: DatabaseTableConstraintChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}>) {
  const headerClassName = "text-xs p-2 text-left bg-secondary border";

  const newConstraint = useCallback(
    (con: DatabaseTableColumnConstraint) => {
      onChange((prev) => ({
        ...prev,
        constraints: [
          ...prev.constraints,
          {
            id: window.crypto.randomUUID(),
            new: con,
            old: null,
          },
        ],
      }));
    },
    [onChange]
  );

  return (
    <div className="px-4 py-2">
      <table className="w-full">
        <thead>
          <tr>
            <th className={cn(headerClassName, "w-[175px]")}>Constraints</th>
            <th className={cn(headerClassName, "w-[150px]")}></th>
            <th className={headerClassName}></th>
            <th className={cn(headerClassName, "w-[30px]")}></th>
          </tr>
        </thead>
        <tbody>
          {constraints.map((constraint, idx) => {
            return (
              <ColumnItem
                key={idx}
                idx={idx}
                constraint={constraint}
                onChange={onChange}
              />
            );
          })}
          <tr>
            <td colSpan={4} className="px-4 py-2 border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"}>
                    <LucideShieldPlus className="w-4 h-4 mr-1" />
                    Add Constraint
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    inset
                    onClick={() => {
                      newConstraint({ primaryKey: true });
                    }}
                  >
                    Primary Key
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    inset
                    onClick={() => {
                      newConstraint({ unique: true });
                    }}
                  >
                    Unique
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    inset
                    onClick={() => {
                      newConstraint({ checkExpression: "" });
                    }}
                  >
                    Check Constraint
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    inset
                    onClick={() => {
                      newConstraint({
                        foreignKey: {
                          columns: [],
                        },
                      });
                    }}
                  >
                    Foreign Key
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

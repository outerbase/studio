import { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import {
  LucideArrowUpRight,
  LucideCheck,
  LucideFingerprint,
  LucideKeySquare,
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
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import ColumnListEditor from "../column-list-editor";
import { useColumnList } from "./column-provider";
import { useSchema } from "@/context/schema-provider";

type ConstraintChangeHandler = (
  constraint: DatabaseTableColumnConstraint
) => void;

function ColumnCheck({
  constraint,
  onChange,
  disabled,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
  disabled?: boolean;
}>) {
  return (
    <>
      <td className="border p-2">
        <LucideCheck className="w-4 h-4 inline mr-2" /> Check
      </td>
      <td className="border" colSpan={2}>
        <input
          onChange={(e) => {
            onChange({
              ...constraint,
              checkExpression: e.currentTarget.value,
            });
          }}
          readOnly={disabled}
          value={constraint.checkExpression}
          className="font-mono p-2 w-full outline-none"
        />
      </td>
    </>
  );
}

function ColumnForeignKey({
  constraint,
  onChange,
  disabled,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
  disabled?: boolean;
}>) {
  const { columns } = useColumnList();
  const { schema } = useSchema();

  const columnMemo = useMemo(() => {
    return [...new Set(columns.map((c) => c.new?.name ?? c.old?.name ?? ""))];
  }, [columns]);

  const fkColumnMemo = useMemo(() => {
    const fkTableName = constraint.foreignKey?.foreignTableName;

    if (fkTableName) {
      const fkTableSchema = schema.find(
        (s) => s.type === "table" && s.name === fkTableName
      );

      console.log(fkTableSchema, "table schema");

      if (fkTableSchema) {
        return (fkTableSchema.tableSchema?.columns ?? []).map((c) => c.name);
      }
    }

    return [];
  }, [constraint, schema]);

  const onConstraintChange = useCallback(
    (newColumn: string[]) => {
      onChange({
        ...constraint,
        foreignKey: { ...constraint.foreignKey, columns: newColumn },
      });
    },
    [onChange, constraint]
  );

  const onFkConstraintChange = useCallback(
    (newColumn: string[]) => {
      onChange({
        ...constraint,
        foreignKey: { ...constraint.foreignKey, foreignColumns: newColumn },
      });
    },
    [onChange, constraint]
  );

  const onFkTableNameChange = useCallback(
    (fkTableName: string) => {
      onChange({
        ...constraint,
        foreignKey: { ...constraint.foreignKey, foreignTableName: fkTableName },
      });
    },
    [onChange, constraint]
  );

  return (
    <>
      <td className="border p-2">
        <LucideArrowUpRight className="w-4 h-4 inline mr-2" />
        Foreign Key
      </td>
      <td className="border">
        <TableCombobox
          borderless
          disabled={disabled}
          onChange={onFkTableNameChange}
          value={constraint.foreignKey?.foreignTableName}
        />
      </td>
      <td className="border">
        <div className="p-1 px-2 flex gap-2 items-center">
          <ColumnListEditor
            disabled={disabled}
            value={constraint.foreignKey?.columns ?? []}
            columns={columnMemo}
            onChange={onConstraintChange}
          />
          |
          <ColumnListEditor
            disabled={disabled}
            value={constraint.foreignKey?.foreignColumns ?? []}
            columns={fkColumnMemo}
            onChange={onFkConstraintChange}
          />
        </div>
      </td>
    </>
  );
}

function ColumnPrimaryKey({
  constraint,
  onChange,
  disabled,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
  disabled?: boolean;
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
            disabled={disabled}
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
  onChange,
  disabled,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
  disabled?: boolean;
}>) {
  const { columns } = useColumnList();

  const columnMemo = useMemo(() => {
    return [...new Set(columns.map((c) => c.new?.name ?? c.old?.name ?? ""))];
  }, [columns]);

  const onConstraintChange = useCallback(
    (newColumn: string[]) => {
      onChange({ ...constraint, uniqueColumns: newColumn });
    },
    [onChange, constraint]
  );

  return (
    <>
      <td className="border p-2">
        <LucideFingerprint className="w-4 h-4 inline mr-2" />
        Unique
      </td>
      <td className="border" colSpan={2}>
        <div className="px-2 p-1 flex gap-2">
          <ColumnListEditor
            disabled={disabled}
            value={constraint.uniqueColumns ?? []}
            columns={columnMemo}
            onChange={onConstraintChange}
          />
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
  onChange,
  constraint,
  disabled,
}: PropsWithChildren<{
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  constraint: DatabaseTableConstraintChange;
  disabled?: boolean;
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
    return (
      <ColumnForeignKey
        disabled={disabled}
        constraint={currentConstraint}
        onChange={onChangeConstraint}
      />
    );
  }

  if (currentConstraint.primaryKey) {
    return (
      <ColumnPrimaryKey
        disabled={disabled}
        constraint={currentConstraint}
        onChange={onChangeConstraint}
      />
    );
  }

  if (currentConstraint.unique) {
    return (
      <ColumnUnique
        disabled={disabled}
        constraint={currentConstraint}
        onChange={onChangeConstraint}
      />
    );
  }

  if (currentConstraint.checkExpression !== undefined) {
    return (
      <ColumnCheck
        disabled={disabled}
        constraint={currentConstraint}
        onChange={onChangeConstraint}
      />
    );
  }

  return <td colSpan={4}></td>;
}

function ColumnItem({
  constraint,
  onChange,
  idx,
  disabled,
}: Readonly<{
  constraint: DatabaseTableConstraintChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  idx: number;
  disabled?: boolean;
}>) {
  return (
    <RemovableConstraintItem idx={idx} onChange={onChange}>
      <ColumnItemBody
        constraint={constraint}
        onChange={onChange}
        idx={idx}
        disabled={disabled}
      />
    </RemovableConstraintItem>
  );
}

export default function SchemaEditorConstraintList({
  constraints,
  onChange,
  disabled,
}: Readonly<{
  constraints: DatabaseTableConstraintChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  disabled?: boolean;
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
            <th className={cn(headerClassName, "w-[200px]")}></th>
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
                disabled={disabled}
              />
            );
          })}
          {!disabled && (
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
          )}
        </tbody>
      </table>
    </div>
  );
}

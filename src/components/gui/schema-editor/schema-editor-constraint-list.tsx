import { useSchema } from "@/context/schema-provider";
import {
  DatabaseTableColumnConstraint,
  DatabaseTableConstraintChange,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { generateId } from "@/lib/generate-id";
import { cn } from "@/lib/utils";
import {
  LucideArrowUpRight,
  LucideCheck,
  LucideFingerprint,
  LucideKeySquare,
  LucideShieldPlus,
  LucideTrash2,
} from "lucide-react";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import ColumnListEditor from "../column-list-editor";
import TableCombobox from "../table-combobox/TableCombobox";
import { useColumnList } from "./column-provider";

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
        <LucideCheck className="mr-2 inline h-4 w-4" /> Check
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
          className="w-full p-2 font-mono outline-hidden"
        />
      </td>
    </>
  );
}

function ColumnForeignKey({
  constraint,
  onChange,
  disabled,
  schemaName,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  onChange: ConstraintChangeHandler;
  disabled?: boolean;
  schemaName: string;
}>) {
  const { columns } = useColumnList();
  const { schema } = useSchema();

  const columnMemo = useMemo(() => {
    return [...new Set(columns.map((c) => c.new?.name ?? c.old?.name ?? ""))];
  }, [columns]);

  const fkColumnMemo = useMemo(() => {
    const fkTableName = constraint.foreignKey?.foreignTableName;

    if (fkTableName) {
      const fkTableSchema = (schema[schemaName] ?? []).find(
        (s) => s.type === "table" && s.name === fkTableName
      );

      if (fkTableSchema) {
        return (fkTableSchema.tableSchema?.columns ?? []).map((c) => c.name);
      }
    }

    return [];
  }, [constraint, schemaName, schema]);

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
        <LucideArrowUpRight className="mr-2 inline h-4 w-4" />
        Foreign Key
      </td>
      <td className="border">
        <TableCombobox
          borderless
          schemaName={schemaName}
          disabled={disabled}
          onChange={onFkTableNameChange}
          value={constraint.foreignKey?.foreignTableName}
        />
      </td>
      <td className="border">
        <div className="flex items-center gap-2 p-1 px-2">
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
        <LucideKeySquare className="mr-2 inline h-4 w-4" />
        Primary Key
      </td>
      <td className="border" colSpan={2}>
        <div className="flex gap-2 p-1 px-2">
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
        <LucideFingerprint className="mr-2 inline h-4 w-4" />
        Unique
      </td>
      <td className="border" colSpan={2}>
        <div className="flex gap-2 p-1 px-2">
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
          <LucideTrash2 className="h-4 w-4 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

function ColumnItemBody({
  onChange,
  schemaName,
  constraint,
  disabled,
}: PropsWithChildren<{
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  constraint: DatabaseTableConstraintChange;
  schemaName?: string;
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

  if (currentConstraint.foreignKey && schemaName) {
    return (
      <ColumnForeignKey
        disabled={disabled}
        constraint={currentConstraint}
        onChange={onChangeConstraint}
        schemaName={schemaName}
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
  schemaName,
  disabled,
}: Readonly<{
  constraint: DatabaseTableConstraintChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  idx: number;
  disabled?: boolean;
  schemaName?: string;
}>) {
  return (
    <RemovableConstraintItem idx={idx} onChange={onChange}>
      <ColumnItemBody
        constraint={constraint}
        onChange={onChange}
        idx={idx}
        schemaName={schemaName}
        disabled={disabled}
      />
    </RemovableConstraintItem>
  );
}

export default function SchemaEditorConstraintList({
  constraints,
  onChange,
  schemaName,
  disabled,
}: Readonly<{
  constraints: DatabaseTableConstraintChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  schemaName?: string;
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
            id: generateId(),
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
                schemaName={schemaName}
              />
            );
          })}
          {!disabled && (
            <tr>
              <td colSpan={4} className="border px-4 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size={"sm"}>
                      <LucideShieldPlus className="mr-1 h-4 w-4" />
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

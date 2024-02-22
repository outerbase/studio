import {
  DatabaseColumnConflict,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
} from "@/drivers/DatabaseDriver";
import { DatabaseTableColumnChange, DatabaseTableSchemaChange } from ".";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LucideKey, LucideTrash2, MoreHorizontal, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TableColumnDataType } from "@/app/(components)/OptimizeTable";
import { convertSqliteType } from "@/lib/sql-helper";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnDefaultValueInput from "./ColumnDefaultValueInput";
import TableCombobox from "../table-combobox/TableCombobox";

function changeColumnOnIndex(
  idx: number,
  value: Partial<DatabaseTableColumn> | null,
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>
) {
  onChange((prev) => {
    if (prev) {
      const columns = [...(prev?.columns ?? [])];
      if (columns[idx] && columns[idx].new) {
        columns[idx].new =
          value === null
            ? null
            : {
                ...(columns[idx].new as DatabaseTableColumn),
                ...value,
                constraint: {
                  ...columns[idx].new?.constraint,
                  ...value?.constraint,
                },
              };

        if (!columns[idx].new && !columns[idx].old) {
          // remove the column
          return {
            ...prev,
            columns: columns.filter((_, colIdx) => colIdx !== idx),
          };
        }

        return {
          ...prev,
          columns,
        };
      }
    }
    return prev;
  });
}

function ConflictClauseOptions({
  value,
  onChange,
}: Readonly<{
  value?: DatabaseColumnConflict;
  onChange?: (v: DatabaseColumnConflict) => void;
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Conflict" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ROLLBACK">Rollback</SelectItem>
        <SelectItem value="ABORT">Abort</SelectItem>
        <SelectItem value="FAIL">Fail</SelectItem>
        <SelectItem value="IGNORE">Ignore</SelectItem>
        <SelectItem value="REPLACE">Replace</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ColumnConstraintContainer({
  onRemoved,
  name,
  children,
}: Readonly<
  PropsWithChildren<{ name: string; disabled?: boolean; onRemoved: () => void }>
>) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center flex-shrink-0">
        <Trash2 size={14} className="text-red-500" onClick={onRemoved} />
      </div>
      <div className="flex items-center w-[80px] flex-shrink-0">{name}</div>
      <div className="flex gap-2 flex-grow">{children}</div>
      <div className={"w-[80px] flex-shrink-0"}></div>
    </div>
  );
}

function ColumnItem({
  value,
  idx,
  onChange,
}: {
  value: DatabaseTableColumnChange;
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>;
}) {
  const disabled = !!value.old;

  const change = useCallback(
    (newValue: Partial<DatabaseTableColumn> | null) => {
      changeColumnOnIndex(idx, newValue, onChange);
    },
    [idx, onChange]
  );

  let highlightClassName = "";
  if (value.new === null) {
    highlightClassName = "bg-red-50";
  } else if (value.old === null) {
    highlightClassName = "bg-green-100";
  } else if (value.new?.name !== value.old?.name) {
    highlightClassName = "bg-yellow-100";
  }

  const column = value.new || value.old;
  if (!column) return null;

  const normalizeType = convertSqliteType(column.type);
  let type = "TEXT";

  if (normalizeType === TableColumnDataType.INTEGER) type = "INTEGER";
  if (normalizeType === TableColumnDataType.REAL) type = "REAL";
  if (normalizeType === TableColumnDataType.BLOB) type = "BLOB";

  return (
    <div className={"p-1 text-sm " + highlightClassName}>
      <div className="flex">
        <div className="mt-3 pl-2 w-[30px] text-red-600">
          {column.pk && <LucideKey size={15} />}
        </div>
        <div className="flex flex-col gap-1">
          <div className={"flex p-1 gap-2"}>
            <Input
              value={column.name}
              className={"w-[200px] bg-white"}
              onChange={(e) => change({ name: e.currentTarget.value })}
            />
            <Select
              value={type}
              onValueChange={(newType) => change({ type: newType })}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select datatype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTEGER">Integer</SelectItem>
                <SelectItem value="REAL">Real</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="BLOB">Blob</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-[180px]">
              <ColumnDefaultValueInput
                onChange={(constraint: DatabaseTableColumnConstraint) =>
                  change({ constraint })
                }
                constraint={column.constraint}
                disabled={disabled}
              />
            </div>
            <div className="flex items-center justify-center w-[75px]">
              <Checkbox
                disabled={disabled}
                checked={column.constraint?.notNull}
                onCheckedChange={(notNull: boolean) =>
                  change({ constraint: { notNull } })
                }
              />
            </div>
          </div>

          {column.constraint?.foreignKey && (
            <ColumnConstraintContainer
              name="Foreign Key"
              onRemoved={() => {
                change({
                  constraint: {
                    unique: undefined,
                    uniqueConflict: undefined,
                  },
                });
              }}
            >
              <TableCombobox
                value={column.constraint.foreignKey.foreignTableName}
                onChange={(newTable) => {
                  change({
                    constraint: {
                      foreignKey: {
                        ...column?.constraint?.foreignKey,
                        foreignTableName: newTable,
                      },
                    },
                  });
                }}
              />
            </ColumnConstraintContainer>
          )}

          {column.constraint?.primaryKey && (
            <ColumnConstraintContainer
              name="Primary Key"
              onRemoved={() => {
                change({
                  constraint: {
                    primaryKey: undefined,
                    primaryKeyConflict: undefined,
                    primaryKeyOrder: undefined,
                  },
                });
              }}
            >
              <Select>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">ASC</SelectItem>
                  <SelectItem value="DESC">DESC</SelectItem>
                </SelectContent>
              </Select>
              <ConflictClauseOptions />
            </ColumnConstraintContainer>
          )}

          {column.constraint?.unique && (
            <ColumnConstraintContainer
              name="Unique"
              onRemoved={() => {
                change({
                  constraint: {
                    unique: undefined,
                    uniqueConflict: undefined,
                  },
                });
              }}
            >
              <ConflictClauseOptions />
            </ColumnConstraintContainer>
          )}

          {column.constraint?.generatedExpression !== undefined && (
            <ColumnConstraintContainer
              name="Generating"
              onRemoved={() =>
                change({
                  constraint: {
                    generatedExpression: undefined,
                    generatedType: undefined,
                  },
                })
              }
            >
              <Input
                disabled={disabled}
                placeholder="Generate Expression"
                className="font-mono bg-white"
                onChange={(e) => {
                  change({
                    constraint: {
                      generatedExpression: e.currentTarget.value,
                    },
                  });
                }}
                value={column.constraint.generatedExpression ?? ""}
              />
              <Select
                value={column.constraint?.generatedType}
                onValueChange={(type) => {
                  change({
                    constraint: {
                      generatedType: type as "STORED" | "VIRTUAL",
                    },
                  });
                }}
              >
                <SelectTrigger className="w-[100px] bg-white">
                  <SelectValue placeholder="Select datatype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="STORED">Stored</SelectItem>
                </SelectContent>
              </Select>
            </ColumnConstraintContainer>
          )}

          {column.constraint?.checkExpression !== undefined && (
            <ColumnConstraintContainer
              name="Check"
              onRemoved={() => {
                change({
                  constraint: {
                    checkExpression: undefined,
                  },
                });
              }}
            >
              <Input
                placeholder="Check Expression"
                className="font-mono bg-white"
                value={column.constraint.checkExpression ?? ""}
              />
            </ColumnConstraintContainer>
          )}
        </div>
        <div className="flex w-[40px] text-xs ml-3">
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="bg-yellow-400 w-6 h-6 rounded flex justify-center items-center cursor">
                  <MoreHorizontal size={15} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Constraint</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  inset
                  disabled={disabled}
                  onClick={() => {
                    change({ constraint: { primaryKey: true } });
                  }}
                >
                  Primary Key
                </DropdownMenuItem>
                <DropdownMenuItem
                  inset
                  disabled={disabled}
                  onClick={() => {
                    change({ constraint: { unique: true } });
                  }}
                >
                  Unique
                </DropdownMenuItem>
                <DropdownMenuItem
                  inset
                  disabled={disabled}
                  onClick={() => {
                    change({
                      constraint: {
                        checkExpression: "",
                      },
                    });
                  }}
                >
                  Check Constraint
                </DropdownMenuItem>
                <DropdownMenuItem inset disabled={disabled}>
                  Foreign Key
                </DropdownMenuItem>
                <DropdownMenuItem
                  inset
                  disabled={disabled}
                  onClick={() => {
                    change({
                      constraint: {
                        generatedType: "VIRTUAL",
                        generatedExpression: "",
                      },
                    });
                  }}
                >
                  Virtuality
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    change(null);
                  }}
                >
                  <LucideTrash2 className="mr-1" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemaEditorColumnList({
  columns,
  onChange,
}: Readonly<{
  columns: DatabaseTableColumnChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>;
}>) {
  return (
    <div className="flex flex-col gap-2 mb-4 p-4 flex-grow">
      <div className="flex text-xs font-bold">
        <div className="w-[30px] mr-2"></div>
        <div className="w-[200px] mr-1">Name</div>
        <div className="w-[180px] mr-1">Datatype</div>
        <div className="w-[180px] mr-1">Default</div>
        <div className="w-[75px] text-center">Not Null</div>
        <div className="w-[40px] ml-3"></div>
      </div>

      {columns.map((col, idx) => (
        <ColumnItem idx={idx} value={col} key={idx} onChange={onChange} />
      ))}
    </div>
  );
}

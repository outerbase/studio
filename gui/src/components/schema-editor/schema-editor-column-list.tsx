import { DatabaseTableColumnChange, DatabaseTableSchemaChange } from ".";
import { Dispatch, SetStateAction, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LucidePlus, LucideTrash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { convertSqliteType } from "@/sqlite/sql-helper";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnDefaultValueInput from "./column-default-value-input";
import { checkSchemaColumnChange } from "@/lib/sql-generate.schema";
import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  TableColumnDataType,
} from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import ColumnPrimaryKeyPopup from "./column-pk-popup";
import ColumnUniquePopup from "./column-unique-popup";
import ColumnForeignKeyPopup from "./column-fk-popup";
import ColumnGeneratingPopup from "./column-generate-popup";
import ColumnCheckPopup from "./column-check-popup";

export type ColumnChangeEvent = (
  newValue: Partial<DatabaseTableColumn> | null
) => void;

function changeColumnOnIndex(
  idx: number,
  value: Partial<DatabaseTableColumn> | null,
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>
) {
  onChange((prev) => {
    if (prev) {
      const columns = [...(prev?.columns ?? [])];
      if (columns[idx]?.new) {
        columns[idx].new =
          value === null
            ? null
            : {
                ...(columns[idx].new as DatabaseTableColumn),
                ...value,
                constraint: value?.constraint
                  ? {
                      ...columns[idx].new?.constraint,
                      ...value?.constraint,
                    }
                  : columns[idx].new?.constraint,
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

function ColumnItem({
  value,
  idx,
  onChange,
}: {
  value: DatabaseTableColumnChange;
  idx: number;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}) {
  const disabled = !!value.old;

  const change = useCallback(
    (newValue: Partial<DatabaseTableColumn> | null) => {
      changeColumnOnIndex(idx, newValue, onChange);
    },
    [idx, onChange]
  );

  const column = value.new || value.old;
  if (!column) return null;

  const normalizeType = convertSqliteType(column.type);
  let type = "TEXT";

  if (normalizeType === TableColumnDataType.INTEGER) type = "INTEGER";
  if (normalizeType === TableColumnDataType.REAL) type = "REAL";
  if (normalizeType === TableColumnDataType.BLOB) type = "BLOB";

  let highlightClassName = "";
  if (value.new === null) {
    highlightClassName = "bg-red-400 dark:bg-red-800";
  } else if (value.old === null) {
    highlightClassName = "bg-green-500 dark:bg-green-800";
  } else if (checkSchemaColumnChange(value)) {
    highlightClassName = "bg-yellow-400";
  }

  return (
    <tr>
      <td className={cn("border-l border-t border-b", highlightClassName)}></td>
      <td className="border-r border-t border-b">
        <input
          value={column.name}
          onChange={(e) => change({ name: e.currentTarget.value })}
          className="p-2 text-sm outline-none bg-background w-[150px]"
          spellCheck={false}
        />
      </td>
      <td className="border">
        <Select
          value={type}
          onValueChange={(newType) => change({ type: newType })}
          disabled={disabled}
        >
          <SelectTrigger className="bg-background border-0 rounded-none shadow-none text-sm">
            <SelectValue placeholder="Select datatype" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTEGER">Integer</SelectItem>
            <SelectItem value="REAL">Real</SelectItem>
            <SelectItem value="TEXT">Text</SelectItem>
            <SelectItem value="BLOB">Blob</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="border">
        <ColumnDefaultValueInput
          onChange={(constraint: DatabaseTableColumnConstraint) =>
            change({ constraint })
          }
          constraint={column.constraint}
          disabled={disabled}
        />
      </td>
      <td className="border text-center w-[50px]">
        <Checkbox
          disabled={disabled}
          checked={!column.constraint?.notNull}
          onCheckedChange={(nullable: boolean) =>
            change({ constraint: { notNull: !nullable } })
          }
        />
      </td>
      <td className="border px-2">
        <div className="flex gap-2">
          {column.constraint?.primaryKey && (
            <ColumnPrimaryKeyPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.unique && (
            <ColumnUniquePopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.checkExpression !== undefined && (
            <ColumnCheckPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.generatedExpression !== undefined && (
            <ColumnGeneratingPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.foreignKey && (
            <ColumnForeignKeyPopup
              constraint={column.constraint.foreignKey}
              disabled={disabled}
              onChange={change}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 shadow border rounded">
                <LucidePlus className="w-4 h-4" />
              </button>
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
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({
                    constraint: {
                      foreignKey: {},
                    },
                  });
                }}
              >
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
      <td className="px-1 border">
        <button
          className="p-1"
          onClick={() => {
            change(null);
          }}
        >
          <LucideTrash2 className="w-4 h-4 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

export default function SchemaEditorColumnList({
  columns,
  onChange,
}: Readonly<{
  columns: DatabaseTableColumnChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}>) {
  const headerStyle = "text-xs p-2 text-left bg-secondary border";

  return (
    <div className="p-4">
      <table className="w-full rounded overflow-hidden">
        <thead>
          <tr>
            <td className={cn(headerStyle, "w-[20px]")}></td>
            <th className={cn(headerStyle, "w-[100px]")}>Name</th>
            <th className={cn(headerStyle, "w-[150px]")}>Type</th>
            <th className={cn(headerStyle, "w-[150px]")}>Default</th>
            <th className={cn(headerStyle, "w-[50px]")}>Null</th>
            <th className={cn(headerStyle)}>Constraint</th>
            <th className={cn(headerStyle, "w-[30px]")}></th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col, idx) => (
            <ColumnItem idx={idx} value={col} key={idx} onChange={onChange} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

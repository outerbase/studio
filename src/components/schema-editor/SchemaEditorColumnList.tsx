import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
} from "@/drivers/DatabaseDriver";
import { DatabaseTableColumnChange, DatabaseTableSchemaChange } from ".";
import { ChangeEvent, Dispatch, SetStateAction, useCallback } from "react";
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

  const onNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      changeColumnOnIndex(idx, { name: e.currentTarget.value }, onChange);
    },
    [onChange, idx]
  );

  const onTypeChange = useCallback(
    (newType: string) => {
      if (!disabled) {
        changeColumnOnIndex(idx, { type: newType }, onChange);
      }
    },
    [onChange, idx, disabled]
  );

  const onDefaultValueChange = useCallback(
    (constraint: DatabaseTableColumnConstraint) => {
      changeColumnOnIndex(idx, { constraint }, onChange);
    },
    [onChange, idx]
  );

  const onNotNullChange = useCallback(
    (notNull: boolean) => {
      changeColumnOnIndex(idx, { constraint: { notNull } }, onChange);
    },
    [onChange, idx]
  );

  const onRemoved = useCallback(() => {
    changeColumnOnIndex(idx, null, onChange);
  }, [idx, onChange]);

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
    <div className="p-1 text-sm">
      <div className={"flex " + highlightClassName}>
        <div className="mt-3 pl-2 w-[30px] text-red-600">
          {column.pk && <LucideKey size={15} />}
        </div>
        <div className="flex flex-col gap-2">
          <div className={"flex p-1 gap-2"}>
            <Input
              value={column.name}
              className={"w-[200px] bg-white"}
              onChange={onNameChange}
            />
            <Select value={type} onValueChange={onTypeChange}>
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
                onChange={onDefaultValueChange}
                constraint={column.constraint}
                disabled={disabled}
              />
            </div>
            <div className="flex items-center justify-center w-[75px]">
              <Checkbox
                disabled={disabled}
                checked={column.constraint?.notNull}
                onCheckedChange={onNotNullChange}
              />
            </div>
          </div>

          {column.constraint?.generatedExpression && (
            <div className="flex gap-2">
              <div className="flex items-center">
                <Trash2 size={14} className="text-red-500" />
              </div>
              <div className="flex items-center">Generating</div>
              <Input
                placeholder="Default Value"
                className="font-mono"
                value={column.constraint.generatedExpression ?? ""}
              />
              <Select value={type}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select datatype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEGER">Virtual</SelectItem>
                  <SelectItem value="REAL">Stored</SelectItem>
                </SelectContent>
              </Select>
              <div className={"w-[135px]"}></div>
            </div>
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
                <DropdownMenuItem inset disabled={disabled}>
                  Primary Key
                </DropdownMenuItem>
                <DropdownMenuItem inset disabled={disabled}>
                  Unique
                </DropdownMenuItem>
                <DropdownMenuItem inset disabled={disabled}>
                  Check Constraint
                </DropdownMenuItem>
                <DropdownMenuItem inset disabled={disabled}>
                  Foreign Key
                </DropdownMenuItem>
                <DropdownMenuItem inset disabled={disabled}>
                  Virtuality
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemoved}>
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

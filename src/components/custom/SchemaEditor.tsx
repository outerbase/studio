import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
} from "@/drivers/DatabaseDriver";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  ChevronsUpDown,
  LucideKey,
  LucideTrash2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { convertSqliteType } from "@/lib/sql-helper";
import { TableColumnDataType } from "@/app/(components)/OptimizeTable";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { Button } from "../ui/button";

interface DatabaseTableColumnChange {
  old: DatabaseTableColumn | null;
  new: DatabaseTableColumn | null;
}

export interface DatabaseTableSchemaChange {
  name: {
    old?: string;
    new?: string;
  };
  columns: DatabaseTableColumnChange[];
}

interface Props {
  value: DatabaseTableSchemaChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>;
}

function DefaultValueInput({
  constraint,
}: {
  constraint?: DatabaseTableColumnConstraint;
}) {
  const display = useMemo(() => {
    if (
      constraint?.defaultValue !== undefined &&
      constraint?.defaultValue !== null
    ) {
      return constraint.defaultValue.toString();
    } else if (constraint?.defaultExpression !== undefined) {
      return constraint?.defaultExpression;
    } else if (constraint?.autoIncrement) {
      return <span className="font-bold">Auto Increment</span>;
    }

    return <span className="text-gray-500">No Default</span>;
  }, [constraint]);

  const noDefaultValue =
    constraint?.defaultValue === undefined &&
    constraint?.defaultExpression === undefined &&
    !constraint?.autoIncrement;

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex text-left shadow-sm py-2 px-3 rounded-md border w-[180px] h-full bg-white">
          <div className="flex-grow">{display}</div>
          <div className="text-gray-400 flex items-center">
            <ChevronsUpDown size={14} />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="no-default-value" checked={noDefaultValue} />
            <Label htmlFor="no-default-value">No Default Value</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="auto-increment" checked={constraint?.autoIncrement} />
            <Label htmlFor="auto-increment">Autoincrement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-value"
              checked={constraint?.defaultValue !== undefined}
            />
            <Label htmlFor="custom-value">Custom Value</Label>
          </div>
          <div className="flex mt-2 mb-2">
            <Input
              placeholder="Default Value"
              value={constraint?.defaultValue?.toString() ?? ""}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-expression"
              checked={constraint?.defaultExpression !== undefined}
            />
            <Label htmlFor="custom-expression">Custom Expression</Label>
          </div>
          <div className="flex mt-2 mb-2">
            <Input
              placeholder="Expression"
              value={constraint?.defaultExpression?.toString() ?? ""}
            />
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="current-time"
              checked={
                constraint?.defaultExpression?.toUpperCase() === "CURRENT_TIME"
              }
            />
            <Label htmlFor="current-time">CURRENT_TIME</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="current-date"
              checked={
                constraint?.defaultExpression?.toUpperCase() === "CURRENT_DATE"
              }
            />
            <Label htmlFor="current-date">CURRENT_DATE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="current-timestamp"
              checked={
                constraint?.defaultExpression?.toUpperCase() ===
                "CURRENT_TIMESTAMP"
              }
            />
            <Label htmlFor="current-timestamp">CURRENT_TIMESTAMP</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function changeColumnOnIndex(
  idx: number,
  value: Partial<DatabaseTableColumn> | null,
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>
) {
  onChange((prev) => {
    if (prev) {
      const columns = [...prev?.columns];
      if (columns[idx] && columns[idx].new) {
        columns[idx].new =
          value === null
            ? null
            : {
                ...(columns[idx].new as DatabaseTableColumn),
                ...value,
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
  const onNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      changeColumnOnIndex(idx, { name: e.currentTarget.value }, onChange);
    },
    [onChange, idx]
  );

  const onTypeChange = useCallback(
    (newType: string) => {
      changeColumnOnIndex(idx, { type: newType }, onChange);
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
  const disabled = !!value.old;

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
              <DefaultValueInput constraint={column.constraint} />
            </div>
            <div className="flex items-center justify-center w-[75px]">
              <Checkbox checked={column.constraint?.notNull} />
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

export default function SchemaEditor({ value, onChange }: Readonly<Props>) {
  const onAddColumn = useCallback(() => {
    onChange({
      ...value,
      columns: [
        ...value.columns,
        {
          old: null,
          new: {
            name: "column",
            type: "TEXT",
            constraint: {},
          },
        },
      ],
    });
  }, [value, onChange]);

  return (
    <div className="w-full h-full p-4">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex text-xs font-bold">
          <div className="w-[30px] mr-2"></div>
          <div className="w-[200px] mr-1">Name</div>
          <div className="w-[180px] mr-1">Datatype</div>
          <div className="w-[180px] mr-1">Default</div>
          <div className="w-[75px] text-center">Not Null</div>
          <div className="w-[40px] ml-3"></div>
        </div>

        {value.columns.map((col, idx) => (
          <ColumnItem idx={idx} value={col} key={idx} onChange={onChange} />
        ))}
      </div>

      <div className="pl-[30px]">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant={"outline"}>Add</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset onClick={onAddColumn}>
              Column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem inset>Primary Key</DropdownMenuItem>
            <DropdownMenuItem inset>Unique</DropdownMenuItem>
            <DropdownMenuItem inset>Check Constraint</DropdownMenuItem>
            <DropdownMenuItem inset>Foreign Key</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

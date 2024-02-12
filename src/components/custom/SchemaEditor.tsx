import {
  DatabaseTableColumn,
  DatabaseTableSchema,
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

interface SchemaEditorProps {
  initialSchema: DatabaseTableSchema;
}

function DefaultValueInput() {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex text-left shadow-sm py-2 px-3 rounded-md border w-[180px] h-full">
          <div className="flex-grow">Default</div>
          <div className="text-gray-400 flex items-center">
            <ChevronsUpDown size={14} />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">No Default Value</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one3" id="option-one" />
              <Label htmlFor="option-one">Autoincrement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Custom Value</Label>
            </div>
            <div className="flex mt-2 mb-2">
              <Input placeholder="Default Value" />
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Custom Expression</Label>
            </div>
            <div className="flex mt-2 mb-2">
              <Input placeholder="Expression" />
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">CURRENT_TIME</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">CURRENT_DATE</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">CURRENT_TIMESTAMP</Label>
            </div>
          </RadioGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColumnItem({
  column,
  idx,
}: {
  column: DatabaseTableColumn;
  idx: number;
}) {
  const normalizeType = convertSqliteType(column.type);
  let type = "TEXT";

  if (normalizeType === TableColumnDataType.INTEGER) type = "INTEGER";
  if (normalizeType === TableColumnDataType.REAL) type = "REAL";
  if (normalizeType === TableColumnDataType.BLOB) type = "BLOB";

  return (
    <div className="p-1 text-sm">
      <div className="flex">
        <div className="mt-2 w-[30px]">{idx + 1}</div>
        <div className="mt-2 w-[30px] text-red-600">
          {column.pk && <LucideKey size={15} />}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input value={column.name} className="w-[200px]" readOnly />
            <Select value={type}>
              <SelectTrigger className="w-[180px]">
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
              <DefaultValueInput />
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
          <div className="mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="bg-yellow-400 w-6 h-6 rounded flex justify-center items-center cursor">
                  <MoreHorizontal size={15} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Constraint</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Primary Key</DropdownMenuItem>
                <DropdownMenuItem>Unique</DropdownMenuItem>
                <DropdownMenuItem>Check Constraint</DropdownMenuItem>
                <DropdownMenuItem>Foreign Key</DropdownMenuItem>
                <DropdownMenuItem>Virtuality</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemaEditor({
  initialSchema,
}: Readonly<SchemaEditorProps>) {
  return (
    <div className="w-full h-full p-4">
      <div className="flex flex-col gap-2">
        <div className="flex text-xs font-bold">
          <div className="w-[30px] mr-2">#</div>
          <div className="w-[30px] mr-2"></div>
          <div className="w-[200px] mr-1">Name</div>
          <div className="w-[180px] mr-1">Datatype</div>
          <div className="w-[180px] mr-1">Default</div>
          <div className="w-[75px] text-center">Not Null</div>
          <div className="w-[40px] ml-3"></div>
        </div>

        {initialSchema.columns.map((col, idx) => (
          <ColumnItem idx={idx} column={col} key={col.name ?? ""} />
        ))}
      </div>
    </div>
  );
}

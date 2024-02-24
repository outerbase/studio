import { DatabaseTableColumn } from "@/drivers/DatabaseDriver";
import { LucidePlus, LucideShieldPlus, LucideTable } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { Dispatch, SetStateAction, useCallback } from "react";
import { Button } from "../ui/button";
import SchemaEditorColumnList from "./SchemaEditorColumnList";

export interface DatabaseTableColumnChange {
  old: DatabaseTableColumn | null;
  new: DatabaseTableColumn | null;
}

export interface DatabaseTableSchemaChange {
  name: {
    old?: string;
    new?: string;
  };
  columns: DatabaseTableColumnChange[];
  createScript?: string;
}

interface Props {
  value: DatabaseTableSchemaChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange | undefined>>;
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow-0 flex-shrink-0">
        <div className="p-1 flex gap-2">
          <div className="bg-secondary rounded overflow-hidden flex items-center ml-3">
            <div className="text-sm px-2 text-gray-500 bg-gray-200 h-full flex items-center">
              <LucideTable className="h-4 w-4 text-black" />
            </div>
            <input
              type="text"
              value={value.name.new ?? value.name.old ?? ""}
              className="bg-inherit p-1 pl-2 pr-2 outline-none text-sm font-mono h-full flex-grow"
            />
          </div>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button variant="ghost">Save</Button>
          <Button variant="ghost">Discard Change</Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button variant="ghost" onClick={onAddColumn}>
            <LucidePlus className="w-4 h-4 mr-1" />
            Add Column
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost">
                <LucideShieldPlus className="w-4 h-4 mr-1" />
                Add Constraint
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem inset>Primary Key</DropdownMenuItem>
              <DropdownMenuItem inset>Unique</DropdownMenuItem>
              <DropdownMenuItem inset>Check Constraint</DropdownMenuItem>
              <DropdownMenuItem inset>Foreign Key</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
      </div>
      <div className="flex-grow overflow-y-auto">
        <SchemaEditorColumnList columns={value.columns} onChange={onChange} />
      </div>
    </div>
  );
}

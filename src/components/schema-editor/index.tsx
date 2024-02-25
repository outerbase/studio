import { DatabaseTableColumn } from "@/drivers/DatabaseDriver";
import { LucidePlus, LucideShieldPlus } from "lucide-react";
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
import { Input } from "../ui/input";

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
  onSave: () => void;
  value: DatabaseTableSchemaChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}

export default function SchemaEditor({
  value,
  onChange,
  onSave,
}: Readonly<Props>) {
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
          <Button variant="ghost" onClick={onSave}>
            Save
          </Button>
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

        <div className="flex items-center mx-3 mt-1 mb-2 ml-5 gap-2">
          <div className="text-xs flex items-center justify-center">Name</div>
          <Input
            placeholder="Table Name"
            value={value.name.new ?? value.name.old ?? ""}
            onChange={(e) => {
              onChange({
                ...value,
                name: {
                  ...value.name,
                  new: e.currentTarget.value,
                },
              });
            }}
            className="w-[200px]"
          />
        </div>
        <Separator />
      </div>
      <div className="flex-grow overflow-y-auto">
        <SchemaEditorColumnList columns={value.columns} onChange={onChange} />
      </div>
    </div>
  );
}

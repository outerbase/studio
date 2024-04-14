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
import SchemaEditorColumnList from "./schema-editor-column-list";
import { Input } from "../ui/input";
import { checkSchemaChange } from "@/lib/sql-generate.schema";
import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
} from "@/drivers/base-driver";
import SchemaEditorConstraintList from "./schema-editor-constraint-list";

export interface DatabaseTableColumnChange {
  old: DatabaseTableColumn | null;
  new: DatabaseTableColumn | null;
}

export interface DatabaseTableConstraintChange {
  old: DatabaseTableColumnConstraint | null;
  new: DatabaseTableColumnConstraint | null;
}

export interface DatabaseTableSchemaChange {
  name: {
    old?: string;
    new?: string;
  };
  columns: DatabaseTableColumnChange[];
  constraints?: DatabaseTableConstraintChange[];
  createScript?: string;
}

interface Props {
  onSave: () => void;
  onDiscard: () => void;
  value: DatabaseTableSchemaChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}

export default function SchemaEditor({
  value,
  onChange,
  onSave,
  onDiscard,
}: Readonly<Props>) {
  const onAddColumn = useCallback(() => {
    const newColumn =
      value.columns.length === 0
        ? {
            name: "id",
            type: "INTEGER",
            constraint: {
              primaryKey: true,
            },
          }
        : {
            name: "column",
            type: "TEXT",
            constraint: {},
          };

    onChange({
      ...value,
      columns: [
        ...value.columns,
        {
          old: null,
          new: newColumn,
        },
      ],
    });
  }, [value, onChange]);

  const hasChange = checkSchemaChange(value);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grow-0 shrink-0">
        <div className="p-1 flex gap-2">
          <Button variant="ghost" onClick={onSave} disabled={!hasChange}>
            Save
          </Button>
          <Button
            variant="ghost"
            onClick={onDiscard}
            disabled={!hasChange}
            className="text-red-500"
          >
            Discard Change
          </Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button variant="ghost" onClick={onAddColumn}>
            <LucidePlus className="w-4 h-4 mr-1" />
            Add Column
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" disabled>
                <LucideShieldPlus className="w-4 h-4 mr-1" />
                Add Constraint (coming soon)
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
      <div className="grow overflow-y-auto">
        <SchemaEditorColumnList columns={value.columns} onChange={onChange} />
        {value.constraints && value.constraints.length > 0 && (
          <SchemaEditorConstraintList constraints={value.constraints} />
        )}
      </div>
    </div>
  );
}

import { LucideCode, LucidePlus } from "lucide-react";
import { Separator } from "../ui/separator";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { Button, buttonVariants } from "../ui/button";
import SchemaEditorColumnList from "./schema-editor-column-list";
import { Input } from "../ui/input";
import generateSqlSchemaChange, {
  checkSchemaChange,
} from "@gui/lib/sql-generate.schema";
import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
} from "@gui/drivers/base-driver";
import SchemaEditorConstraintList from "./schema-editor-constraint-list";
import { ColumnsProvider } from "./column-provider";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CodePreview from "../code-preview";

export interface DatabaseTableColumnChange {
  old: DatabaseTableColumn | null;
  new: DatabaseTableColumn | null;
}

export interface DatabaseTableConstraintChange {
  id: string;
  old: DatabaseTableColumnConstraint | null;
  new: DatabaseTableColumnConstraint | null;
}

export interface DatabaseTableSchemaChange {
  name: {
    old?: string;
    new?: string;
  };
  columns: DatabaseTableColumnChange[];
  constraints: DatabaseTableConstraintChange[];
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
  console.log(value);
  const isCreateScript = value.name.old === "";

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

  const previewScript = useMemo(() => {
    return generateSqlSchemaChange(value).join("\n");
  }, [value]);

  console.log(value);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grow-0 shrink-0">
        <div className="p-1 flex gap-2">
          <Button
            variant="ghost"
            onClick={onSave}
            disabled={!hasChange}
            size={"sm"}
          >
            Save
          </Button>
          <Button
            size={"sm"}
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

          <Button variant="ghost" onClick={onAddColumn} size={"sm"}>
            <LucidePlus className="w-4 h-4 mr-1" />
            Add Column
          </Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Popover>
            <PopoverTrigger>
              <div className={buttonVariants({ size: "sm", variant: "ghost" })}>
                <LucideCode className="w-4 h-4 mr-1" />
                SQL Preview
              </div>
            </PopoverTrigger>
            <PopoverContent style={{ width: 500 }}>
              <div className="text-xs font-semibold mb-1">SQL Preview</div>
              <div style={{ maxHeight: 400 }} className="overflow-y-auto">
                <CodePreview code={previewScript} />
              </div>
            </PopoverContent>
          </Popover>
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
        <ColumnsProvider value={value.columns}>
          <SchemaEditorConstraintList
            constraints={value.constraints}
            onChange={onChange}
            disabled={!isCreateScript}
          />
        </ColumnsProvider>
      </div>
    </div>
  );
}

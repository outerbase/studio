import { useStudioContext } from "@/context/driver-provider";
import { DatabaseTableSchemaChange } from "@/drivers/base-driver";
import { generateId } from "@/lib/generate-id";
import { checkSchemaChange } from "@/lib/sql/sql-generate.schema";
import { LucideCode, LucideCopy, LucidePlus, LucideSave } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";
import CodePreview from "../code-preview";
import { ColumnsProvider } from "./column-provider";
import SchemaEditorColumnList from "./schema-editor-column-list";
import SchemaEditorConstraintList from "./schema-editor-constraint-list";
import SchemaNameSelect from "./schema-name-select";

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
  const { databaseDriver } = useStudioContext();
  const isCreateScript = value.name.old === "";

  const onAddColumn = useCallback(() => {
    const newColumn =
      value.columns.length === 0
        ? {
            name: "id",
            type: databaseDriver.columnTypeSelector.idTypeName ?? "INTEGER",
            constraint: {
              primaryKey: true,
            },
          }
        : {
            name: "column",
            type: databaseDriver.columnTypeSelector.textTypeName ?? "TEXT",
            constraint: {},
          };

    onChange({
      ...value,
      columns: [
        ...value.columns,
        {
          key: generateId(),
          old: null,
          new: newColumn,
        },
      ],
    });
  }, [value, onChange, databaseDriver]);

  const hasChange = checkSchemaChange(value);

  const previewScript = useMemo(() => {
    return databaseDriver.createUpdateTableSchema(value).join(";\n");
  }, [value, databaseDriver]);

  const editorOptions = useMemo(() => {
    return {
      collations: databaseDriver.getCollationList(),
    };
  }, [databaseDriver]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 grow-0">
        <div className="flex gap-2 p-1">
          <Button
            variant="ghost"
            onClick={onSave}
            disabled={!hasChange || !value.name?.new || !value.schemaName}
            size={"sm"}
          >
            <LucideSave className="mr-2 h-4 w-4" />
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
            <LucidePlus className="mr-1 h-4 w-4" />
            Add Column
          </Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Popover>
            <PopoverTrigger>
              <div className={buttonVariants({ size: "sm", variant: "ghost" })}>
                <LucideCode className="mr-1 h-4 w-4" />
                SQL Preview
              </div>
            </PopoverTrigger>
            <PopoverContent style={{ width: 500 }}>
              <div className="mb-1 text-xs font-semibold">SQL Preview</div>
              <div style={{ maxHeight: 400 }} className="overflow-y-auto">
                <CodePreview code={previewScript} />
              </div>
            </PopoverContent>
          </Popover>

          {value.createScript && (
            <Popover>
              <PopoverTrigger>
                <div
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <LucideCode className="mr-1 h-4 w-4" />
                  Create Script
                </div>
              </PopoverTrigger>
              <PopoverContent style={{ width: 500 }}>
                <Button
                  variant={"outline"}
                  size="sm"
                  onClick={() => {
                    toast.success("Copied create script successfully");
                    window.navigator.clipboard.writeText(
                      value.createScript ?? ""
                    );
                  }}
                >
                  <LucideCopy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <div
                  style={{ maxHeight: 400 }}
                  className="mt-2 overflow-y-auto"
                >
                  <CodePreview code={value.createScript} />
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="mx-3 mt-3 mb-4 ml-5 flex items-center gap-2">
          <div>
            <div className="mb-1 text-xs font-medium">Table Name</div>
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
          <div>
            <div className="mb-1 text-xs font-medium">Schema</div>
            <SchemaNameSelect
              readonly={!isCreateScript}
              value={value.schemaName}
              onChange={(selectedSchema) => {
                onChange({ ...value, schemaName: selectedSchema });
              }}
            />
          </div>
        </div>
        <Separator />
      </div>
      <div className="grow overflow-y-auto">
        <SchemaEditorColumnList
          columns={value.columns}
          onChange={onChange}
          onAddColumn={onAddColumn}
          schemaName={value.schemaName}
          options={editorOptions}
          disabledEditExistingColumn={
            !databaseDriver.getFlags().supportModifyColumn
          }
        />
        <ColumnsProvider value={value.columns}>
          <SchemaEditorConstraintList
            schemaName={value.schemaName}
            constraints={value.constraints}
            onChange={onChange}
            disabled={!isCreateScript}
          />
        </ColumnsProvider>
      </div>
    </div>
  );
}

import { useDatabaseDriver } from "@/context/driver-provider";
import {
  DatabaseTriggerSchema,
  TriggerOperation,
  TriggerWhen,
} from "@/drivers/base-driver";
import TableCombobox from "../table-combobox/TableCombobox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SqlEditor from "../sql-editor";
import { produce } from "immer";
import SchemaNameSelect from "../schema-editor/schema-name-select";
import { useSchema } from "@/context/schema-provider";
import { useMemo } from "react";

export interface TriggerEditorProps {
  onChange: (value: DatabaseTriggerSchema) => void;
  value: DatabaseTriggerSchema;
}

export default function TriggerEditor({ value, onChange }: TriggerEditorProps) {
  const { databaseDriver } = useDatabaseDriver();
  const { autoCompleteSchema, schema } = useSchema();

  const extendedAutoCompleteSchema = useMemo(() => {
    const currentSchema = schema[value.schemaName];
    if (!currentSchema) return autoCompleteSchema;

    const currentTable = currentSchema.find(
      (t) => t.name.toLowerCase() === value.tableName.toLowerCase()
    )?.tableSchema;
    if (!currentTable) return autoCompleteSchema;

    // Extend OLD and NEW
    const currentTableColumns = currentTable.columns.map((c) => c.name);

    return {
      ...autoCompleteSchema,
      NEW: currentTableColumns,
      OLD: currentTableColumns,
    };
  }, [autoCompleteSchema, value.schemaName, value.tableName, schema]);

  return (
    <>
      <div className="px-4 py-2 flex flex-row gap-2">
        <Input
          value={value.name}
          placeholder="Trigger Name"
          onChange={(e) =>
            onChange(
              produce(value, (draft) => {
                draft.name = e.currentTarget.value;
              })
            )
          }
        />
      </div>
      <div className="px-4 py-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="w-[200px]">
            <Select
              value={value?.when ?? "BEFORE"}
              onValueChange={(e) =>
                onChange(
                  produce(value, (draft) => {
                    draft.when = e as TriggerWhen;
                  })
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="When" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEFORE">Before</SelectItem>
                <SelectItem value="AFTER">After</SelectItem>
                <SelectItem value="INSTEAD_OF">Instead Of</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Select
              value={value?.operation}
              onValueChange={(newOperation: TriggerOperation) => {
                onChange(
                  produce(value, (draft) => {
                    draft.operation = newOperation;
                  })
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSERT">Insert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <SchemaNameSelect
              value={value.schemaName}
              onChange={(schemaName) => {
                onChange(
                  produce(value, (draft) => {
                    draft.schemaName = schemaName;
                  })
                );
              }}
            />
          </div>
          <div className="w-[200px]">
            <TableCombobox
              schemaName={value.schemaName}
              value={value.tableName}
              onChange={(newTableName) => {
                onChange(
                  produce(value, (draft) => {
                    draft.tableName = newTableName;
                  })
                );
              }}
            />
          </div>
        </div>
      </div>

      <div className="grow overflow-hidden">
        <div className="h-full">
          <div className="text-xs my-2 mx-4">
            Trigger statement: (eg: &quot;SET NEW.columnA =
            TRIM(OLD.columnA)&quot;)
          </div>

          <SqlEditor
            value={value?.statement ?? ""}
            dialect={databaseDriver.getFlags().dialect}
            schema={extendedAutoCompleteSchema}
            onChange={(newStatement) =>
              onChange(
                produce(value, (draft) => {
                  draft.statement = newStatement;
                })
              )
            }
          />
        </div>
      </div>
    </>
  );
}

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

interface TriggerEditorProps {
  onChange: (value: DatabaseTriggerSchema) => void;
  value: DatabaseTriggerSchema;
}

export default function TriggerEditor({ value, onChange }: TriggerEditorProps) {
  const { databaseDriver } = useDatabaseDriver();

  return (
    <>
      <div className="p-4 flex flex-row gap-2">
        <div className="w-full">
          <div className="text-xs mb-2">Trigger Name</div>
          <Input
            value={value.name}
            onChange={(e) =>
              onChange(
                produce(value, (draft) => {
                  draft.name = e.currentTarget.value;
                })
              )
            }
          />
        </div>
        <div className="w-[200px]">
          <div className="text-xs mb-2">On Table</div>
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
      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs">Event</div>
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

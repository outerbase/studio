import { useDatabaseDriver } from "@/context/driver-provider";
import { DatabaseTriggerSchemaChange } from "@/drivers/base-driver";
import { LucideAlertCircle } from "lucide-react";
import { useState } from "react";
import TableCombobox from "../table-combobox/TableCombobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SqlEditor from "../sql-editor";
import { TriggerController } from "./trigger-controller";
import { TriggerSaveDialog } from "./trigger-save-dialog";
import { useTriggerState } from "./trigger-state";

export interface TriggerEditorProps {
  name: string;
  tableName?: string;
  schemaName: string;
}

interface Props extends TriggerEditorProps {
  onSave: (trigger: TriggerEditorProps) => void;
}

export default function TriggerEditor(props: Props) {
  const { name, tableName, schemaName } = props;
  const { databaseDriver } = useDatabaseDriver();
  const { trigger, setTriggerField, error, onDiscard, previewScript } = useTriggerState(schemaName, name, tableName ?? '');
  const [isExecuting, setIsExecuting] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      {
        isExecuting && (
          <TriggerSaveDialog
            onSave={(value) => {
              props.onSave(value);
              setIsExecuting(false);
            }}
            onClose={() => setIsExecuting(false)}
            previewScript={previewScript}
            schemaName={schemaName}
            trigger={trigger as DatabaseTriggerSchemaChange}
            tableName={tableName}
          />
        )
      }
      <TriggerController
        onSave={() => setIsExecuting(true)}
        onDiscard={onDiscard}
        previewScript={previewScript.join('\n')}
        disabled={!trigger.name?.new || !schemaName || !trigger.isChange}
        isExecuting={isExecuting}
      />
      <div className="p-4 flex flex-row gap-2">
        <div className="w-full">
          <div className="text-xs mb-2">Trigger Name</div>
          <Input value={trigger?.name.new ?? trigger?.name.old ?? ""} onChange={e => setTriggerField('name', { ...trigger.name, new: e.currentTarget.value })} />
        </div>
        <div className="w-[200px]">
          <div className="text-xs mb-2">On Table</div>
          <TableCombobox
            schemaName={schemaName}
            value={trigger?.tableName}
            onChange={value => setTriggerField('tableName', value)}
          />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs">Event</div>
        <div className="flex gap-2">
          <div className="w-[200px]">
            <Select value={trigger?.when ?? "BEFORE"} onValueChange={value => setTriggerField('when', value)}>
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
            <Select value={trigger?.operation} onValueChange={value => setTriggerField('operation', value)}>
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
      {error && (
        <div className="text-sm text-red-500 font-mono flex gap-4 justify-start items-end">
          <LucideAlertCircle />
          <p>{error}</p>
        </div>
      )}
      <div className="grow overflow-hidden">
        <div className="h-full">
          <div className="text-xs my-2 mx-4">Trigger statement: (eg: &quot;SET NEW.columnA = TRIM(OLD.columnA)&quot;)</div>
          <SqlEditor
            value={trigger?.statement ?? ""}
            dialect={databaseDriver.getFlags().dialect}
            onChange={value => setTriggerField('statement', value)}
          />
        </div>
      </div>
    </div >
  )
}
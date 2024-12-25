import { useDatabaseDriver } from "@/context/driver-provider";
import { DatabaseTriggerSchemaChange, TriggerOperation, TriggerWhen } from "@/drivers/base-driver";
import { LucideAlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import TableCombobox from "../table-combobox/TableCombobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SqlEditor from "../sql-editor";
import { TriggerController } from "./trigger-controller";
import { TriggerSaveDialog } from "./trigger-save-dialog";

export interface TriggerEditorProps {
  name: string;
  tableName?: string;
  schemaName: string;
}

interface Props extends TriggerEditorProps {
  onSave: (trigger: TriggerEditorProps) => void;
}

const initailTrigger: DatabaseTriggerSchemaChange = {
  name: {
    new: ''
  },
  operation: "INSERT",
  when: "BEFORE",
  tableName: "",
  whenExpression: "",
  statement: "",
  schemaName: ''
}

function triggerHasChange(defaultTrigger: DatabaseTriggerSchemaChange, trigger: DatabaseTriggerSchemaChange) {
  const objects = Object.keys(defaultTrigger) as (keyof DatabaseTriggerSchemaChange)[];

  for (const key of objects) {
    if (defaultTrigger[key as keyof DatabaseTriggerSchemaChange] !== trigger[key as keyof DatabaseTriggerSchemaChange]) {
      return true;
    }
  }

  return false;
}

export default function TriggerEditor(props: Props) {
  const { name, tableName, schemaName } = props;
  const { databaseDriver } = useDatabaseDriver();
  const [defaultTrigger, setDefaultTrigger] = useState<DatabaseTriggerSchemaChange>({
    ...initailTrigger
  })
  const [trigger, setTrigger] = useState<DatabaseTriggerSchemaChange>({
    ...initailTrigger
  });
  const [error, setError] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);

  const previewScript = useMemo(() => {
    return trigger ? databaseDriver.createUpdateTriggerSchema(trigger) : [''];
  }, [trigger, databaseDriver]);

  const triggerChanging = useMemo(() => triggerHasChange(defaultTrigger, trigger), [defaultTrigger, trigger])

  const getDefaultTrigger = useCallback(() => {
    if (name !== 'create') {
      databaseDriver
        .trigger(schemaName, name)
        .then(res => {
          const t = {
            ...res,
            name: {
              new: res.name || '',
              old: res.name || ''
            },
            schemaName
          }
          setDefaultTrigger(t)
          setTrigger(t)
        })
        .catch((e: Error) => {
          setError(e.message);
        });
    }
    else {
      const t = {
        ...initailTrigger,
        tableName: tableName ?? "",
        schemaName
      }
      setDefaultTrigger(t);
      setTrigger(t)
    }
  }, [databaseDriver, name, schemaName, tableName])

  useEffect(() => {
    getDefaultTrigger();
  }, [getDefaultTrigger]);

  const onDiscard = () => {
    setTrigger({ ...defaultTrigger })
  }

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
            trigger={trigger}
            tableName={tableName}
          />
        )
      }
      <TriggerController
        onSave={() => setIsExecuting(true)}
        onDiscard={onDiscard}
        previewScript={previewScript.join('\n')}
        disabled={!trigger.name?.new || !schemaName || !triggerChanging}
        isExecuting={isExecuting}
      />
      <div className="p-4 flex flex-row gap-2">
        <div className="w-full">
          <div className="text-xs mb-2">Trigger Name</div>
          <Input value={trigger?.name.new ?? trigger?.name.old ?? ""} onChange={e => setTrigger({ ...trigger, name: { ...trigger.name, new: e.target.value } })} />
        </div>
        <div className="w-[200px]">
          <div className="text-xs mb-2">On Table</div>
          <TableCombobox
            schemaName={schemaName}
            value={trigger?.tableName}
            onChange={value => {
              setTrigger({
                ...trigger,
                tableName: value
              })
            }}
          />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs">Event</div>
        <div className="flex gap-2">
          <div className="w-[200px]">
            <Select value={trigger?.when ?? "BEFORE"} onValueChange={value => setTrigger({ ...trigger, when: value as TriggerWhen })}>
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
            <Select value={trigger?.operation} onValueChange={value => setTrigger({ ...trigger, operation: value as TriggerOperation })}>
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
        <div className="text-sm text-red-500 font-mono flex gap-4 justify-end items-end">
          <LucideAlertCircle className="w-12 h-12" />
          <p>{error}</p>
        </div>
      )}
      <div className="grow overflow-hidden">
        <div className="h-full">
          <div className="text-xs my-2 mx-4">Trigger statement: (eg: &quot;SET NEW.columnA = TRIM(OLD.columnA)&quot;)</div>
          <SqlEditor
            value={trigger?.statement ?? ""}
            dialect={databaseDriver.getFlags().dialect}
            onChange={value => setTrigger({ ...trigger, statement: value })}
          />
        </div>
      </div>
    </div >
  )
}
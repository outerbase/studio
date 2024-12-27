import { useSchema } from "@/context/schema-provider";
import TriggerEditor, { TriggerEditorProps } from "../trigger-editor";
import { useTabsContext } from "../windows-tab";
import { LucideTableProperties } from "lucide-react";

export default function TriggerTab(props: TriggerEditorProps) {
  const { refresh: refreshSchema } = useSchema();
  const { replaceCurrentTab } = useTabsContext();

  const onSave = (trigger: TriggerEditorProps) => {
    refreshSchema();
    console.log(trigger)
    replaceCurrentTab({
      component: (
        <TriggerTab
          tableName={trigger.tableName}
          schemaName={trigger.schemaName}
          name={trigger.name ?? ''}
        />
      ),
      key: 'trigger-' + trigger.name || '',
      identifier: 'trigger-' + trigger.name || '',
      title: trigger.name || '',
      icon: LucideTableProperties,
    });
  }

  return <TriggerEditor {...props} onSave={onSave} />
}

import TriggerTab from "@/components/gui/tabs/trigger-tab";
import { LucideCog } from "lucide-react";
import openUnsafeTab from "./open-tab";

export default function builtinOpenTriggerTab(payload: {
  schemaName: string;
  tableName?: string;
  name?: string;
}) {
  return openUnsafeTab({
    title: payload.name ?? "New Trigger",
    identifier: "trigger",
    key: "trigger-" + (payload.name ?? ""),
    component: (
      <TriggerTab
        schemaName={payload.schemaName}
        name={payload.name ?? ""}
        tableName={payload.tableName ?? ""}
      />
    ),
    icon: LucideCog,
    type: "trigger",
  });
}

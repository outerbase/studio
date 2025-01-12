import RelationalDiagramTab from "@/components/gui/tabs/relational-diagram-tab";
import { TreeStructure } from "@phosphor-icons/react";
import openUnsafeTab from "./open-tab";

export default function builtinOpenERDTab() {
  return openUnsafeTab({
    title: "Relational Diagram",
    identifier: "erd",
    key: "erd",
    component: <RelationalDiagramTab />,
    icon: TreeStructure,
    type: "erd",
  });
}

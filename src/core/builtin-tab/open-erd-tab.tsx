import RelationalDiagramTab from "@/components/gui/tabs/relational-diagram-tab";
import { TreeStructure } from "@phosphor-icons/react";
import { createTabExtension } from "../extension-tab";

export const builtinOpenERDTab = createTabExtension({
  name: "erd",
  key: () => "",
  generate: () => ({
    title: "Relational Diagram",
    component: <RelationalDiagramTab />,
    icon: TreeStructure,
  }),
});

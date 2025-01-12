import MassDropTableTab from "@/components/gui/tabs/mass-drop-table";
import { StackMinus } from "@phosphor-icons/react";
import { createTabExtension } from "../extension-tab";

export const builtinMassDropTableTab = createTabExtension({
  name: "mass-drop-table",
  key: () => "",
  generate: () => ({
    title: "Mass Drop Tables",
    component: <MassDropTableTab />,
    icon: StackMinus,
  }),
});

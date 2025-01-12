import MassDropTableTab from "@/components/gui/tabs/mass-drop-table";
import { StackMinus } from "@phosphor-icons/react";
import openUnsafeTab from "./open-tab";

export default function builtinMassDropTableTab() {
  return openUnsafeTab({
    title: "Mass Drop Tables",
    identifier: "mass-drop-table",
    key: "mass-drop-table",
    component: <MassDropTableTab />,
    icon: StackMinus,
    type: "mass-drop-table",
  });
}

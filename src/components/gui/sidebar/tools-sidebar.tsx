"use client";
import ListButtonItem from "../list-button-item";
import { openTab } from "@/messages/open-tab";
import { StackMinus, TreeStructure } from "@phosphor-icons/react";

export default function SettingSidebar() {
  return (
    <div className="flex flex-col grow p-2">
      <ListButtonItem
        text="Relational Diagram"
        onClick={() => {
          openTab({ type: "erd" });
        }}
        icon={TreeStructure}
      />
      <ListButtonItem
        text="Drop & Empty Multiple Tables"
        onClick={() => {
          openTab({ type: "mass-drop-table" });
        }}
        icon={StackMinus}
      />
    </div>
  );
}

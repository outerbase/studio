"use client";
import ListButtonItem from "../list-button-item";
import { openTab } from "@/messages/open-tab";
import { Export, FileCsv, StackMinus } from "@phosphor-icons/react";

export default function SettingSidebar() {
  return (
    <div className="flex flex-col grow p-2">
      <h2 className="text-sm font-semibold m-2">Import Tools</h2>
      <ListButtonItem
        text="Import from Sqlite"
        onClick={() => {
          openTab({ type: "import-sqlite" });
        }}
        icon={Export}
      />
      <ListButtonItem
        text="Import from CSV"
        onClick={() => {
          openTab({ type: "import-csv" });
        }}
        icon={FileCsv}
      />
      <h2 className="text-sm font-semibold m-2">Other</h2>
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

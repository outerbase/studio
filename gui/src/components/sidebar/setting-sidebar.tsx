"use client";
import { LucideUser } from "lucide-react";
import ListButtonItem from "../list-button-item";
import { openTab } from "@gui/messages/open-tab";

export default function SettingSidebar() {
  return (
    <div className="flex flex-col grow p-2">
      <ListButtonItem
        text="User and Permission"
        onClick={() => {
          openTab({ type: "user" });
        }}
        icon={LucideUser}
      />
    </div>
  );
}

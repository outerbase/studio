import type { WindowTabItemProps } from "@/components/gui/windows-tab";
import { MessageChannelName } from "./const";
import type { Dispatch, SetStateAction } from "react";
import {
  LucideCode,
  LucideTable,
  LucideTableProperties,
  LucideUser,
  LucideCog,
} from "lucide-react";
import QueryWindow from "@/components/gui/tabs/query-tab";
import SchemaEditorTab from "@/components/gui/tabs/schema-editor-tab";
import TableDataWindow from "@/components/gui/tabs/table-data-tab";
import UsersTab from "@/components/gui/tabs/users-tabs";
import TriggerTab from "@/components/gui/tabs/trigger-tab";

interface OpenTableTab {
  type: "table";
  tableName: string;
}

interface OpenQueryTab {
  type: "query";
  name?: string;
}

interface OpenTableSchemaTab {
  type: "schema";
  tableName?: string;
}

interface OpenUserTab {
  type: "user";
}

interface OpenTriggerTab {
  type: "trigger";
  tableName?: string;
  name?: string;
}

export type OpenTabsProps =
  | OpenTableTab
  | OpenQueryTab
  | OpenTableSchemaTab
  | OpenUserTab
  | OpenTriggerTab;

export function openTab(props: OpenTabsProps) {
  window.internalPubSub.send(MessageChannelName.OPEN_NEW_TAB, props);
}

function generateKeyFromTab(tab: OpenTabsProps) {
  if (tab.type === "query") return "query-" + window.crypto.randomUUID();
  if (tab.type === "table") return "table-" + tab.tableName;
  if (tab.type === "schema")
    return !tab.tableName ? "create-schema" : "schema-" + tab.tableName;
  if (tab.type === "user") return "user";

  return "trigger-" + (tab.name ?? "");
}

function generateIconFromTab(tab: OpenTabsProps) {
  if (tab.type === "query") return LucideCode;
  if (tab.type === "table") return LucideTable;
  if (tab.type === "schema") return LucideTableProperties;
  if (tab.type === "user") return LucideUser;

  return LucideCog;
}

let QUERY_COUNTER = 2;
function generateTitle(tab: OpenTabsProps) {
  if (tab.type === "query") return "Query " + (QUERY_COUNTER++).toString();
  if (tab.type === "table") return tab.tableName;
  if (tab.type === "schema") return tab.tableName ? tab.tableName : "New Table";
  if (tab.type === "user") return "User & Permission";
  return tab.name ?? "";
}

function generateComponent(tab: OpenTabsProps) {
  if (tab.type === "query") return <QueryWindow />;
  if (tab.type === "table")
    return <TableDataWindow tableName={tab.tableName} />;
  if (tab.type === "schema")
    return <SchemaEditorTab tableName={tab.tableName} />;
  if (tab.type === "user") return <UsersTab />;
  return <TriggerTab name={tab.name ?? ""} />;
}

export function receiveOpenTabMessage({
  newTab,
  setTabs,
  setSelectedTabIndex,
}: {
  newTab: OpenTabsProps;
  setTabs: Dispatch<SetStateAction<WindowTabItemProps[]>>;
  setSelectedTabIndex: Dispatch<SetStateAction<number>>;
}) {
  setTabs((prev) => {
    const key = generateKeyFromTab(newTab);
    const foundIndex = prev.findIndex((tab) => tab.key === key);

    if (foundIndex >= 0) {
      setSelectedTabIndex(foundIndex);
      return prev;
    }
    setSelectedTabIndex(prev.length);

    return [
      ...prev,
      {
        icon: generateIconFromTab(newTab),
        title: generateTitle(newTab),
        key,
        component: generateComponent(newTab),
      },
    ];
  });
}

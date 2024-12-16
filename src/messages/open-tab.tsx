import type { WindowTabItemProps } from "@/components/gui/windows-tab";
import { MessageChannelName, TAB_PREFIX_SAVED_QUERY } from "../const";
import type { Dispatch, SetStateAction } from "react";
import { LucideTableProperties, LucideUser, LucideCog } from "lucide-react";
import QueryWindow from "@/components/gui/tabs/query-tab";
import SchemaEditorTab from "@/components/gui/tabs/schema-editor-tab";
import TableDataWindow from "@/components/gui/tabs/table-data-tab";
import UsersTab from "@/components/gui/tabs/users-tabs";
import TriggerTab from "@/components/gui/tabs/trigger-tab";
import { Binoculars } from "@phosphor-icons/react/dist/ssr";
import { Database, StackMinus, Table, TreeStructure } from "@phosphor-icons/react";
import MassDropTableTab from "@/components/gui/tabs/mass-drop-table";
import RelationalDiagramTab from "@/components/gui/tabs/relational-diagram-tab";
import SchemaDatabase from "@/components/gui/tabs/schema-database-tab";

interface OpenTableTab {
  type: "table";
  schemaName: string;
  tableName: string;
}

interface OpenQueryTab {
  type: "query";
  name?: string;
  saved?: {
    namespaceName?: string;
    key: string;
    sql: string;
  };
}

interface OpenTableSchemaTab {
  type: "schema" | 'database';
  schemaName?: string;
  tableName?: string;
}

interface OpenUserTab {
  type: "user";
}

interface ToolsTab {
  type: "mass-drop-table" | "import-sqlite" | "import-csv" | 'erd';
}

interface OpenTriggerTab {
  type: "trigger";
  schemaName: string;
  tableName?: string;
  name?: string;
}

export type OpenTabsProps =
  | OpenTableTab
  | OpenQueryTab
  | OpenTableSchemaTab
  | OpenUserTab
  | OpenTriggerTab
  | ToolsTab;

export function openTab(props: OpenTabsProps) {
  window.internalPubSub.send(MessageChannelName.OPEN_NEW_TAB, props);
}

export function closeTabs(key: string[]) {
  window.internalPubSub.send(MessageChannelName.CLOSE_TABS, key);
}

function generateKeyFromTab(tab: OpenTabsProps) {
  if (tab.type === "query") {
    if (tab.saved) {
      return TAB_PREFIX_SAVED_QUERY + tab.saved.key;
    }
    return "query-" + window.crypto.randomUUID();
  }

  if (tab.type === "table")
    return "table-" + tab.schemaName + "-" + tab.tableName;
  if (tab.type === "schema")
    return !tab.tableName
      ? "create-schema"
      : "schema-" + tab.schemaName + "-" + tab.tableName;
  if (tab.type === "user") return "user";

  if (tab.type === 'erd') return 'erd';
  if (tab.type === "mass-drop-table") return "mass-drop-table";
  if (tab.type === "import-sqlite") return "import-sqlite";
  if (tab.type === "import-csv") return "import-csv";

  if (tab.type === "trigger") {
    return "trigger-" + (tab.name ?? "");
  }

  if (tab.type === 'database') return !tab.schemaName ? 'create-database' : 'database-' + tab.schemaName

  return "Unnamed";
}

function generateIconFromTab(tab: OpenTabsProps) {
  if (tab.type === "query") return Binoculars;
  if (tab.type === "table") return Table;
  if (tab.type === "schema") return LucideTableProperties;
  if (tab.type === "user") return LucideUser;
  if (tab.type === 'erd') return TreeStructure;
  if (tab.type === "mass-drop-table") return StackMinus;
  if (tab.type === 'database') return Database;

  return LucideCog;
}

let QUERY_COUNTER = 2;
function generateTitle(tab: OpenTabsProps) {
  if (tab.type === "query") {
    if (tab.saved) return tab.name ?? "Query";
    return "Query " + (QUERY_COUNTER++).toString();
  }
  if (tab.type === "table") return tab.tableName;
  if (tab.type === "schema") return tab.tableName ? tab.tableName : "New Table";
  if (tab.type === "user") return "User & Permission";
  if (tab.type === "import-csv") return "Import from CSV";
  if (tab.type === "import-sqlite") return "Import from SQLite";
  if (tab.type === 'erd') return 'Relational Diagram';
  if (tab.type === "mass-drop-table") return "Mass Drop Tables";
  if (tab.type === "trigger") return tab.name ?? "";
  if (tab.type === 'database') return tab.schemaName ? tab.schemaName : 'New Schema/Database';
  return "Unnamed";
}

function generateComponent(tab: OpenTabsProps, title: string) {
  if (tab.type === "query") {
    if (tab.saved) {
      return (
        <QueryWindow
          initialName={title}
          initialCode={tab.saved.sql}
          initialSavedKey={tab.saved.key}
          initialNamespace={tab.saved.namespaceName}
        />
      );
    }
    return <QueryWindow initialName={title} />;
  }
  if (tab.type === "table")
    return (
      <TableDataWindow tableName={tab.tableName} schemaName={tab.schemaName} />
    );
  if (tab.type === "schema")
    return (
      <SchemaEditorTab tableName={tab.tableName} schemaName={tab.schemaName} />
    );
  if (tab.type === "user") return <UsersTab />;
  if (tab.type === "erd") return <RelationalDiagramTab />;
  if (tab.type === "mass-drop-table") return <MassDropTableTab />;
  if (tab.type === "trigger")
    return <TriggerTab schemaName={tab.schemaName} name={tab.name ?? ""} />;
  if (tab.type === 'database') return <SchemaDatabase schemaName={tab.schemaName} />;

  return <div>Unknown Tab</div>;
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
    const foundIndex = prev.findIndex((tab) => tab.identifier === key);

    if (foundIndex >= 0) {
      setSelectedTabIndex(foundIndex);
      return prev;
    }
    setSelectedTabIndex(prev.length);
    const title = generateTitle(newTab);

    return [
      ...prev,
      {
        icon: generateIconFromTab(newTab),
        title,
        key,
        identifier: key,
        component: generateComponent(newTab, title),
      },
    ];
  });
}

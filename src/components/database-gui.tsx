"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useState } from "react";
import WindowTabs, { WindowTabItemProps } from "./windows-tab";
import TableDataContent from "./tabs/table-data-tab";
import useMessageListener from "@/hooks/useMessageListener";
import { MessageChannelName } from "@/messages/const";
import { OpenTabsProps } from "@/messages/openTabs";
import QueryWindow from "@/components/tabs/query-tab";
import SchemaEditorTab from "@/components/tabs/schema-editor-tab";
import {
  LucideCode,
  LucideDatabase,
  LucideSettings,
  LucideTable,
  LucideTableProperties,
} from "lucide-react";
import SidebarTab from "./sidebar-tab";
import SchemaView from "./schema-sidebar";
import { SavedConnectionLabel } from "@/app/connect/saved-connection-storage";

export default function DatabaseGui({
  color,
}: Readonly<{ color: SavedConnectionLabel }>) {
  const DEFAULT_WIDTH = 300;

  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(20);

  useEffect(() => {
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabs, setTabs] = useState<WindowTabItemProps[]>(() => [
    {
      title: "Query",
      key: "query",
      component: <QueryWindow />,
      icon: LucideCode,
    },
  ]);

  useMessageListener<OpenTabsProps>(
    MessageChannelName.OPEN_NEW_TAB,
    (newTab) => {
      setTabs((prev) => {
        if (newTab) {
          if (newTab.type === "table" && newTab.tableName) {
            // Check if there is duplicated
            const foundIndex = prev.findIndex((tab) => tab.key === newTab.key);

            if (foundIndex >= 0) {
              setSelectedTabIndex(foundIndex);
            } else {
              setSelectedTabIndex(prev.length);

              return [
                ...prev,
                {
                  icon: LucideTable,
                  title: newTab.name,
                  key: newTab.key,
                  component: <TableDataContent tableName={newTab.tableName} />,
                },
              ];
            }
          } else if (newTab.type === "query") {
            setSelectedTabIndex(prev.length);

            return [
              ...prev,
              {
                icon: LucideCode,
                title: newTab.name,
                key: newTab.key,
                component: <QueryWindow />,
              },
            ];
          } else if (newTab.type === "schema") {
            // Check if there is duplicated
            const foundIndex = prev.findIndex((tab) => tab.key === newTab.key);

            if (foundIndex >= 0) {
              setSelectedTabIndex(foundIndex);
            } else {
              setSelectedTabIndex(prev.length);

              return [
                ...prev,
                {
                  icon: LucideTableProperties,
                  title: newTab.name,
                  key: newTab.key,
                  component: <SchemaEditorTab tableName={newTab.tableName} />,
                },
              ];
            }
          }
        }

        return prev;
      });
    }
  );

  return (
    <div className="h-screen w-screen flex flex-col">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={5} defaultSize={defaultWidthPercentage}>
          <SidebarTab
            color={color}
            tabs={[
              {
                key: "database",
                name: "Database",
                content: <SchemaView />,
                icon: LucideDatabase,
              },
              {
                key: "setting",
                name: "Setting",
                content: <div className="p-2">Coming Soon</div>,
                icon: LucideSettings,
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={100 - defaultWidthPercentage}>
          <WindowTabs
            tabs={tabs}
            selected={selectedTabIndex}
            onSelectChange={setSelectedTabIndex}
            onTabsChange={setTabs}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useMemo, useState } from "react";
import { openTab } from "@/messages/open-tab";
import WindowTabs, { WindowTabItemProps } from "./windows-tab";
import useMessageListener from "@/components/hooks/useMessageListener";
import { MessageChannelName } from "@/const";
import { OpenTabsProps, receiveOpenTabMessage } from "@/messages/open-tab";
import QueryWindow from "@/components/gui/tabs/query-tab";
import SidebarTab, { SidebarTabItem } from "./sidebar-tab";
import SchemaView from "./schema-sidebar";
import ToolSidebar from "./sidebar/tools-sidebar";

import { useDatabaseDriver } from "@/context/driver-provider";
import SavedDocTab from "./sidebar/saved-doc-tab";
import { useSchema } from "@/context/schema-provider";
import { Binoculars, GearSix, Table } from "@phosphor-icons/react";

export default function DatabaseGui() {
  const DEFAULT_WIDTH = 300;

  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(25);

  useEffect(() => {
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const { databaseDriver, docDriver } = useDatabaseDriver();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { currentSchemaName } = useSchema();
  const [tabs, setTabs] = useState<WindowTabItemProps[]>(() => [
    {
      title: "Query",
      identifier: "query",
      key: "query",
      component: <QueryWindow initialName="Query" />,
      icon: Binoculars,
    },
  ]);

  useMessageListener<OpenTabsProps>(
    MessageChannelName.OPEN_NEW_TAB,
    (newTab) => {
      if (newTab) {
        receiveOpenTabMessage({ newTab, setSelectedTabIndex, setTabs });
      }
    }
  );

  useMessageListener<string[]>(
    MessageChannelName.CLOSE_TABS,
    (keys) => {
      if (keys) {
        setTabs((currentTabs) => {
          const selectedTab = currentTabs[selectedTabIndex];
          const newTabs = currentTabs.filter(
            (t) => !keys?.includes(t.identifier)
          );

          if (selectedTab) {
            const selectedTabNewIndex = newTabs.findIndex(
              (t) => t.identifier === selectedTab.identifier
            );
            if (selectedTabNewIndex < 0) {
              setSelectedTabIndex(
                Math.min(selectedTabIndex, newTabs.length - 1)
              );
            } else {
              setSelectedTabIndex(selectedTabNewIndex);
            }
          }

          return newTabs;
        });
      }
    },
    [selectedTabIndex]
  );

  const sidebarTabs = useMemo(() => {
    return [
      {
        key: "database",
        name: "Schema",
        content: <SchemaView />,
        icon: <Table weight="light" size={24} />,
      },
      docDriver
        ? {
            key: "saved",
            name: "Queries",
            content: <SavedDocTab />,
            icon: <Binoculars weight="light" size={24} />,
          }
        : undefined,
      {
        key: "tools",
        name: "Tools",
        content: <ToolSidebar />,
        icon: <GearSix weight="light" size={24} />,
      },
    ].filter(Boolean) as SidebarTabItem[];
  }, [docDriver]);

  const tabSideMenu = useMemo(() => {
    return [
      {
        text: "New Query",
        onClick: () => {
          openTab({ type: "query" });
        },
      },
      databaseDriver.getFlags().supportCreateUpdateTable
        ? {
            text: "New Table",
            onClick: () => {
              openTab({ type: "schema", schemaName: currentSchemaName });
            },
          }
        : undefined,
    ].filter(Boolean) as { text: string; onClick: () => void }[];
  }, [currentSchemaName, databaseDriver]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={5} defaultSize={defaultWidthPercentage}>
          <SidebarTab tabs={sidebarTabs} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={100 - defaultWidthPercentage}>
          <WindowTabs
            menu={tabSideMenu}
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

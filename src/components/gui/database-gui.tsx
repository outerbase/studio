"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WindowTabs, { WindowTabItemProps } from "./windows-tab";
import QueryWindow from "@/components/gui/tabs/query-tab";
import SidebarTab, { SidebarTabItem } from "./sidebar-tab";
import SchemaView from "./schema-sidebar";
import ToolSidebar from "./sidebar/tools-sidebar";

import { useDatabaseDriver } from "@/context/driver-provider";
import SavedDocTab from "./sidebar/saved-doc-tab";
import { useSchema } from "@/context/schema-provider";
import { Binoculars, GearSix, Table } from "@phosphor-icons/react";
import { normalizedPathname, sendAnalyticEvents } from "@/lib/tracking";
import { useConfig } from "@/context/config-provider";
import { cn } from "@/lib/utils";
import { scc } from "@/core/command";

export default function DatabaseGui() {
  const DEFAULT_WIDTH = 300;

  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(25);

  useEffect(() => {
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const { databaseDriver, docDriver } = useDatabaseDriver();
  const { extensions, containerClassName } = useConfig();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { currentSchemaName } = useSchema();
  const [tabs, setTabs] = useState<WindowTabItemProps[]>(() => [
    {
      title: "Query",
      identifier: "query",
      key: "query",
      component: <QueryWindow initialName="Query" />,
      icon: Binoculars,
      type: "query",
    },
  ]);

  const openTabInternal = useCallback((tabOption: WindowTabItemProps) => {
    setTabs((prev) => {
      const foundIndex = prev.findIndex(
        (tab) => tab.identifier === tabOption.key
      );

      if (foundIndex >= 0) {
        setSelectedTabIndex(foundIndex);
        return prev;
      }
      setSelectedTabIndex(prev.length);

      return [...prev, tabOption];
    });
  }, []);

  const closeStudioTab = useCallback(
    (keys: string[]) => {
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

  useEffect(() => {
    window.outerbaseOpenTab = openTabInternal;
    window.outerbaseCloseTab = closeStudioTab;

    return () => {
      window.outerbaseOpenTab = undefined;
      window.outerbaseCloseTab = undefined;
    };
  }, [openTabInternal, closeStudioTab]);

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
      ...extensions.getSidebars(),
    ].filter(Boolean) as SidebarTabItem[];
  }, [docDriver, extensions]);

  const tabSideMenu = useMemo(() => {
    return [
      {
        text: "New Query",
        onClick: () => {
          scc.tabs.openBuiltinQuery({});
        },
      },
      ...extensions.getWindowTabMenu(),
      databaseDriver.getFlags().supportCreateUpdateTable
        ? {
            text: "New Table",
            onClick: () => {
              scc.tabs.openBuiltinSchema({ schemaName: currentSchemaName });
            },
          }
        : undefined,
    ].filter(Boolean) as { text: string; onClick: () => void }[];
  }, [currentSchemaName, databaseDriver, extensions]);

  // Send to analytic when tab changes.
  const previousLogTabKey = useRef<string>("");
  useEffect(() => {
    const currentTab = tabs[selectedTabIndex];
    if (currentTab && currentTab.key !== previousLogTabKey.current) {
      // We don't log the first tab because it's already logged in the main screen.
      if (previousLogTabKey.current) {
        sendAnalyticEvents([
          {
            name: "page_view",
            data: {
              path: normalizedPathname(window.location.pathname),
              tab: currentTab.type,
              tab_key: currentTab.key,
            },
          },
        ]);
      }

      previousLogTabKey.current = currentTab.key;
    }
  }, [tabs, selectedTabIndex, previousLogTabKey]);

  return (
    <div className={cn("h-screen w-screen flex flex-col", containerClassName)}>
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

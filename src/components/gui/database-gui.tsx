"use client";
import QueryWindow from "@/components/gui/tabs/query-tab";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchemaView from "./schema-sidebar";
import SidebarTab, { SidebarTabItem } from "./sidebar-tab";
import ToolSidebar from "./sidebar/tools-sidebar";
import WindowTabs, { WindowTabItemProps } from "./windows-tab";

import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { scc } from "@/core/command";
import {
  tabCloseChannel,
  tabOpenChannel,
  tabReplaceChannel,
} from "@/core/extension-tab";
import { normalizedPathname, sendAnalyticEvents } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { Binoculars, GearSix, Table } from "@phosphor-icons/react";
import SavedDocTab from "./sidebar/saved-doc-tab";

export default function DatabaseGui() {
  const DEFAULT_WIDTH = 300;

  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(25);

  useEffect(() => {
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const { databaseDriver, docDriver, extensions, containerClassName } =
    useStudioContext();

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

  const replaceTabInternal = useCallback(
    (tabOption: WindowTabItemProps) => {
      setTabs((prev) => {
        const foundIndex = prev.findIndex(
          (tab) => tab.identifier === tabOption.key
        );

        if (foundIndex >= 0) {
          setSelectedTabIndex(foundIndex);
          return prev;
        }

        return prev.map((tab, tabIndex) => {
          if (tabIndex === selectedTabIndex) {
            return tabOption;
          }
          return tab;
        });
      });
    },
    [selectedTabIndex]
  );

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
    return tabOpenChannel.listen(openTabInternal);
  }, [openTabInternal]);

  useEffect(() => {
    return tabCloseChannel.listen(closeStudioTab);
  }, [closeStudioTab]);

  useEffect(() => {
    return tabReplaceChannel.listen(replaceTabInternal);
  }, [replaceTabInternal]);

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
      databaseDriver.getFlags().supportCreateUpdateTable
        ? {
            text: "New Table",
            onClick: () => {
              scc.tabs.openBuiltinSchema({ schemaName: currentSchemaName });
            },
          }
        : undefined,
    ].filter(Boolean) as { text: string; onClick: () => void }[];
  }, [currentSchemaName, databaseDriver]);

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
    <div className={cn("flex h-screen w-screen flex-col", containerClassName)}>
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

"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useMemo, useState } from "react";
import WindowTabs, { WindowTabItemProps } from "./windows-tab";
import useMessageListener from "@/hooks/useMessageListener";
import { MessageChannelName } from "@/messages/const";
import { OpenTabsProps, receiveOpenTabMessage } from "@/messages/open-tab";
import QueryWindow from "@/components/tabs/query-tab";
import { LucideCode, LucideDatabase, LucideSettings } from "lucide-react";
import SidebarTab, { SidebarTabItem } from "./sidebar-tab";
import SchemaView from "./schema-sidebar";
import SettingSidebar from "./sidebar/setting-sidebar";
import { useDatabaseDriver } from "@/contexts/driver-provider";

export default function DatabaseGui() {
  const DEFAULT_WIDTH = 300;

  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(20);

  useEffect(() => {
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const { collaborationDriver } = useDatabaseDriver();
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
      if (newTab) {
        receiveOpenTabMessage({ newTab, setSelectedTabIndex, setTabs });
      }
    }
  );

  const sidebarTabs = useMemo(() => {
    return [
      {
        key: "database",
        name: "Database",
        content: <SchemaView />,
        icon: LucideDatabase,
      },
      collaborationDriver
        ? {
            key: "setting",
            name: "Setting",
            content: <SettingSidebar />,
            icon: LucideSettings,
          }
        : undefined,
    ].filter(Boolean) as SidebarTabItem[];
  }, [collaborationDriver]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={5} defaultSize={defaultWidthPercentage}>
          <SidebarTab tabs={sidebarTabs} />
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

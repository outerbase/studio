"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useState } from "react";
import SchemaView from "./SchemaView";
import WindowTabs, { WindowTabItemProps } from "./WindowTabs";
import TableDataContent from "./TableDataContent";
import useMessageListener from "@/hooks/useMessageListener";
import { MessageChannelName } from "@/messages/const";
import { OpenTabsProps } from "@/messages/openTabs";
import QueryWindow from "@/app/(windows)/QueryWindow";

export default function DatabaseGui() {
  const DEFAULT_WIDTH = 300;
  const MAX_WIDTH = 400;

  const [maxWidthPercentage, setMaxWidthPercentage] = useState(20);
  const [defaultWidthPercentage, setDefaultWidthPercentage] = useState(20);

  useEffect(() => {
    setMaxWidthPercentage(Math.floor((MAX_WIDTH / window.innerWidth) * 100));
    setDefaultWidthPercentage((DEFAULT_WIDTH / window.innerWidth) * 100);
  }, []);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [tabs, setTabs] = useState<WindowTabItemProps[]>(() => [
    { title: "Query", key: "query", component: <QueryWindow /> },
  ]);

  useMessageListener<OpenTabsProps>(
    MessageChannelName.OPEN_NEW_TAB,
    (newTab) => {
      setTabs((prev) => {
        if (newTab && newTab.tableName) {
          // Check if there is duplicated
          const foundIndex = prev.findIndex((tab) => tab.key === newTab.key);

          if (foundIndex >= 0) {
            setSelectedTabIndex(foundIndex);
          } else {
            setSelectedTabIndex(prev.length);

            return [
              ...prev,
              {
                title: newTab.name,
                key: newTab.key,
                component: <TableDataContent tableName={newTab.tableName} />,
              },
            ];
          }
        }
        return prev;
      });
    }
  );

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          minSize={5}
          maxSize={maxWidthPercentage || undefined}
          defaultSize={defaultWidthPercentage}
        >
          <SchemaView />
        </ResizablePanel>
        <ResizableHandle withHandle />
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

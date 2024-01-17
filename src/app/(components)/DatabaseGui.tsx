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
  const [tabs, setTabs] = useState<WindowTabItemProps[]>([]);

  useMessageListener<OpenTabsProps>(
    MessageChannelName.OPEN_NEW_TAB,
    (newTab) => {
      setTabs((prev) => {
        if (newTab && newTab.tableName) {
          return [
            ...prev,
            {
              title: newTab.name,
              key: newTab.key,
              component: <TableDataContent tableName={newTab.tableName} />,
            },
          ];
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
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

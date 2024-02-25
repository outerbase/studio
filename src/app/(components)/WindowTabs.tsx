import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import openNewQuery from "@/messages/openNewQuery";
import { LucidePlus, LucideX } from "lucide-react";
import { createContext, useCallback, useContext, useMemo } from "react";

export interface WindowTabItemProps {
  component: JSX.Element;
  title: string;
  key: string;
}

interface WindowTabsProps {
  tabs: WindowTabItemProps[];
  selected: number;
  onSelectChange: (selectedIndex: number) => void;
  onTabsChange: (value: WindowTabItemProps[]) => void;
}

const WindowTabsContext = createContext<{
  replaceCurrentTab: (tab: WindowTabItemProps) => void;
}>({
  replaceCurrentTab: () => {
    throw new Error("Not implemented");
  },
});

export function useTabsContext() {
  return useContext(WindowTabsContext);
}

export default function WindowTabs({
  tabs,
  selected,
  onSelectChange,
  onTabsChange,
}: WindowTabsProps) {
  const replaceCurrentTab = useCallback(
    (tab: WindowTabItemProps) => {
      if (tabs[selected]) {
        tabs[selected] = tab;
        onTabsChange([...tabs]);
      }
    },
    [tabs, selected, onTabsChange]
  );

  const contextValue = useMemo(
    () => ({ replaceCurrentTab }),
    [replaceCurrentTab]
  );

  return (
    <WindowTabsContext.Provider value={contextValue}>
      <div className="flex flex-col w-full h-full">
        <div className="flex-grow-0 flex-shrink-0">
          <div className="flex p-2 gap-2">
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                openNewQuery();
              }}
            >
              <LucidePlus className="w-4 h-4" />
            </Button>
            {tabs.map((tab, idx) => {
              return (
                <Button
                  size={"sm"}
                  key={tab.key}
                  variant={idx === selected ? "default" : "secondary"}
                  onClick={() => onSelectChange(idx)}
                >
                  {tab.title}
                  <LucideX
                    className="w-4 h-4 ml-2"
                    onClick={() => {
                      onTabsChange(
                        tabs.filter((nextTab) => nextTab.key !== tab.key)
                      );
                    }}
                  />
                </Button>
              );
            })}
          </div>
          <Separator />
        </div>
        <div className="flex-grow relative">
          {tabs.map((tab, tabIndex) => {
            return (
              <div
                className="absolute left-0 right-0 top-0 bottom-0"
                style={{
                  visibility: tabIndex === selected ? "visible" : "hidden",
                }}
                key={tab.key}
              >
                {tab.component}
              </div>
            );
          })}
        </div>
      </div>
    </WindowTabsContext.Provider>
  );
}

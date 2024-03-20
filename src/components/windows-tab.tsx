// windows-tab.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import openNewQuery from "@/messages/openNewQuery";
import { LucidePlus } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTab } from "./sortable-tab";

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
  const [activeTab, setActiveTab] = useState<WindowTabItemProps | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const sensors = useSensors(pointerSensor);

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeIndex = tabs.findIndex((tab) => tab.key === active.id);
    setActiveTab(tabs[activeIndex]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tabs.findIndex((tab) => tab.key === active.id);
      const newIndex = tabs.findIndex((tab) => tab.key === over?.id);
      const newTabs = arrayMove(tabs, oldIndex, newIndex);
      onTabsChange(newTabs);

      const activeIndex = newTabs.findIndex((tab) => tab.key === active.id);
      onSelectChange(activeIndex);
    }
    setActiveTab(null);
  }

  return (
    <WindowTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
              <SortableContext
                items={tabs.map((tab) => tab.key)}
                strategy={verticalListSortingStrategy}
              >
                {tabs.map((tab, idx) => (
                  <SortableTab
                    key={tab.key}
                    tab={tab}
                    selected={
                      activeTab?.key === tab.key ||
                      (idx === selected && !activeTab)
                    }
                    onSelectChange={() => onSelectChange(idx)}
                    onClose={() =>
                      onTabsChange(tabs.filter((t) => t.key !== tab.key))
                    }
                  />
                ))}
              </SortableContext>
            </div>
            <Separator />
          </div>
          <div className="flex-grow relative">
            {tabs.map((tab, tabIndex) => (
              <div
                className="absolute left-0 right-0 top-0 bottom-0"
                style={{
                  visibility: tabIndex === selected ? "visible" : "hidden",
                }}
                key={tab.key}
              >
                {tab.component}
              </div>
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeTab ? (
            <div className="fixed top-0 left-0 w-auto h-auto">
              <Button size={"sm"} variant={"default"}>
                {activeTab.title}
              </Button>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </WindowTabsContext.Provider>
  );
}

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import openNewQuery from "@/messages/openNewQuery";
import { LucidePlus, LucideX } from "lucide-react";
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
  KeyboardSensor,
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
  sortableKeyboardCoordinates,
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      onTabsChange(arrayMove(tabs, oldIndex, newIndex));
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
                    selected={idx === selected}
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
            <div className="bg-white shadow-lg rounded-md p-4">
              {activeTab.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </WindowTabsContext.Provider>
  );
}

import { type LucideIcon, LucidePlus } from "lucide-react";
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
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTab, WindowTabItemButton } from "./sortable-tab";
import { openTab } from "@/messages/open-tab";

export interface WindowTabItemProps {
  component: JSX.Element;
  icon: LucideIcon;
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
  const [dragTab, setDragTag] = useState<WindowTabItemProps | null>(null);

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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeIndex = tabs.findIndex((tab) => tab.key === active.id);
      setDragTag(tabs[activeIndex] ?? null);
    },
    [tabs, setDragTag]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const selectedTab = tabs[selected];
        const oldIndex = tabs.findIndex((tab) => tab.key === active.id);
        const newIndex = tabs.findIndex((tab) => tab.key === over?.id);
        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        onTabsChange(newTabs);

        const selectedIndex = newTabs.findIndex(
          (tab) => tab.key === selectedTab?.key
        );
        onSelectChange(selectedIndex);
      }
      setDragTag(null);
    },
    [setDragTag, onTabsChange, tabs, onSelectChange, selected]
  );

  return (
    <WindowTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col w-full h-full">
          <div className="grow-0 shrink-0 pt-1 bg-secondary">
            <div className="flex">
              <button
                className="px-3 py-2 border-b"
                onClick={() => {
                  openTab({ type: "query" });
                }}
              >
                <LucidePlus className="w-4 h-4" />
              </button>
              <SortableContext
                items={tabs.map((tab) => tab.key)}
                strategy={verticalListSortingStrategy}
              >
                {tabs.map((tab, idx) => (
                  <SortableTab
                    key={tab.key}
                    tab={tab}
                    selected={idx === selected}
                    onSelectChange={() => {
                      onSelectChange(idx);
                    }}
                    onClose={() => {
                      onTabsChange(tabs.filter((t) => t.key !== tab.key));
                    }}
                  />
                ))}
              </SortableContext>
              <div className="border-b grow" />
            </div>
          </div>
          <div className="grow relative mt-1">
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
          {dragTab ? (
            <div className="fixed top-0 left-0 w-auto h-auto">
              <WindowTabItemButton title={dragTab.title} icon={dragTab.icon} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </WindowTabsContext.Provider>
  );
}

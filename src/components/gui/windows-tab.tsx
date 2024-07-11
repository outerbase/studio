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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface WindowTabItemProps {
  component: JSX.Element;
  icon: LucideIcon;
  title: string;
  key: string;
}

interface WindowTabsProps {
  menu?: { text: string; onClick: () => void }[];
  tabs: WindowTabItemProps[];
  selected: number;
  hideCloseButton?: boolean;
  onSelectChange: (selectedIndex: number) => void;
  onTabsChange?: (value: WindowTabItemProps[]) => void;
}

const WindowTabsContext = createContext<{
  replaceCurrentTab: (tab: WindowTabItemProps) => void;
  renameCurrentTab: (name: string) => void;
}>({
  replaceCurrentTab: () => {
    throw new Error("Not implemented");
  },
  renameCurrentTab: () => {
    throw new Error("Not implemented");
  },
});

export function useTabsContext() {
  return useContext(WindowTabsContext);
}

export default function WindowTabs({
  menu,
  tabs,
  selected,
  hideCloseButton,
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
        if (onTabsChange) {
          onTabsChange([...tabs]);
        }
      }
    },
    [tabs, selected, onTabsChange]
  );

  const renameCurrentTab = useCallback(
    (name: string) => {
      if (tabs[selected]) {
        tabs[selected].title = name;
        if (onTabsChange) {
          onTabsChange([...tabs]);
        }
      }
    },
    [tabs, selected, onTabsChange]
  );

  const contextValue = useMemo(
    () => ({ replaceCurrentTab, renameCurrentTab }),
    [replaceCurrentTab, renameCurrentTab]
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

        if (onTabsChange) {
          onTabsChange(newTabs);
        }

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
              {menu ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger>
                    <div className="px-3 py-2 border-b">
                      <LucidePlus className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {menu.map((menuItem, menuIdx) => {
                      return (
                        <DropdownMenuItem
                          key={menuIdx}
                          onClick={menuItem.onClick}
                        >
                          {menuItem.text}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="w-2 border-b"></div>
              )}
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
                    onClose={
                      hideCloseButton
                        ? undefined
                        : () => {
                            const newTabs = tabs.filter(
                              (t) => t.key !== tab.key
                            );

                            if (selected >= idx) {
                              onSelectChange(newTabs.length - 1);
                            }

                            if (onTabsChange) {
                              onTabsChange(newTabs);
                            }
                          }
                    }
                  />
                ))}
              </SortableContext>
              <div className="border-b grow" />
            </div>
          </div>
          <div className="grow relative">
            {tabs.map((tab, tabIndex) => (
              <div
                className="absolute left-0 right-0 top-0 bottom-0"
                style={{
                  visibility: tabIndex === selected ? "inherit" : "hidden",
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

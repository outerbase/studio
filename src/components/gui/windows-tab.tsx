import { type LucideIcon, LucidePlus } from "lucide-react";
import { createContext, useCallback, useContext, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { SortableTab } from "./sortable-tab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { restrictToHorizontalAxis } from "../lib/dnd-kit";

export interface WindowTabItemProps {
  component: JSX.Element;
  icon: LucideIcon;
  title: string;
  identifier: string;
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
  changeCurrentTab: (value: { title?: string; identifier?: string }) => void;
}>({
  replaceCurrentTab: () => {
    throw new Error("Not implemented");
  },
  changeCurrentTab: () => {
    throw new Error("Not implemented");
  },
});

const CurrentWindowTab = createContext<{ isActiveTab: boolean }>({
  isActiveTab: false,
});

export function useTabsContext() {
  return useContext(WindowTabsContext);
}

export function useCurrentTab() {
  return useContext(CurrentWindowTab);
}

export default function WindowTabs({
  menu,
  tabs,
  selected,
  hideCloseButton,
  onSelectChange,
  onTabsChange,
}: WindowTabsProps) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, keyboardSensor);

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

  const changeCurrentTab = useCallback(
    (value: { title?: string; identifier?: string }) => {
      if (tabs[selected]) {
        if (value.title) tabs[selected].title = value.title;
        if (value.identifier) tabs[selected].identifier = value.identifier;

        if (onTabsChange) {
          onTabsChange([...tabs]);
        }
      }
    },
    [tabs, selected, onTabsChange]
  );

  const contextValue = useMemo(
    () => ({ replaceCurrentTab, changeCurrentTab }),
    [changeCurrentTab, replaceCurrentTab]
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
    },
    [onTabsChange, tabs, onSelectChange, selected]
  );

  return (
    <WindowTabsContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <div className="flex flex-col w-full h-full">
          <div className="grow-0 shrink-0 bg-neutral-100 dark:bg-neutral-900 overflow-x-auto no-scrollbar">
            <div className="flex h-[40px]">
              <SortableContext
                items={tabs.map((tab) => tab.key)}
                strategy={horizontalListSortingStrategy}
              >
                {tabs.map((tab, idx) => (
                  <SortableTab
                    key={tab.key}
                    index={idx}
                    tabCount={tabs.length}
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

              {menu && (
                <div className="flex h-[40px] items-center border-b">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                      <div className="ml-1.5 text-xs flex h-7 items-center justify-center gap-1 rounded-lg p-1.5 py-2 text-neutral-600 transition hover:bg-neutral-200 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                        <LucidePlus className="w-4 h-4" /> New
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
                </div>
              )}

              <div className="flex h-[40px] border-b flex-1"></div>
            </div>
          </div>
          <div className="grow relative">
            {tabs.map((tab, tabIndex) => (
              <CurrentWindowTab.Provider
                key={tab.key}
                value={{ isActiveTab: tabIndex === selected }}
              >
                <div
                  className="absolute left-0 right-0 top-0 bottom-0"
                  style={{
                    visibility: tabIndex === selected ? "inherit" : "hidden",
                  }}
                >
                  {tab.component}
                </div>
              </CurrentWindowTab.Provider>
            ))}
          </div>
        </div>
      </DndContext>
    </WindowTabsContext.Provider>
  );
}

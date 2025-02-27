import { restrictToHorizontalAxis } from "@/lib/dnd-kit";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { type LucideIcon, LucidePlus } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SortableTab } from "./sortable-tab";

export interface WindowTabItemProps {
  component: JSX.Element;
  icon: LucideIcon;
  title: string;
  identifier: string;
  key: string;
  type?: string;
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
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;

    const selectedTab = container.children[selected];
    if (!selectedTab) return;

    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = selectedTab.getBoundingClientRect();

    let menuWidth = 0;
    if (tabMenuRef.current) {
      menuWidth = tabMenuRef.current.getBoundingClientRect().width;
    }

    if (selectedTabRect.left < containerRect.left) {
      container.scrollLeft += selectedTabRect.left - containerRect.left;
    } else if (selectedTabRect.right > containerRect.right) {
      container.scrollLeft +=
        selectedTabRect.right - containerRect.right + menuWidth + 1;
    }
  }, [selected, tabs]);

  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0) {
        container.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel);
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

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
        <div className="flex h-full w-full flex-col">
          <div className="no-scrollbar shrink-0 grow-0 overflow-x-auto bg-neutral-100 dark:bg-neutral-900">
            <div
              className="window-tab-scrollbar flex h-[40px]"
              ref={tabContainerRef}
            >
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
                <div
                  ref={tabMenuRef}
                  style={{ zIndex: 50, position: "sticky" }}
                  className={`right-0 flex h-[40px] items-center border-b bg-neutral-100 dark:bg-neutral-900`}
                >
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                      <div className="ml-1.5 flex h-7 items-center justify-center gap-1 rounded-lg p-1.5 py-2 text-sm text-neutral-600 transition hover:bg-neutral-200 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                        <LucidePlus className="h-4 w-4" /> New
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

              <div className="flex h-[40px] flex-1 border-b"></div>
            </div>
          </div>
          <div className="relative grow">
            {tabs.map((tab, tabIndex) => (
              <CurrentWindowTab.Provider
                key={tab.key}
                value={{ isActiveTab: tabIndex === selected }}
              >
                <div
                  className="absolute top-0 right-0 bottom-0 left-0"
                  style={{
                    display: tabIndex === selected ? "inherit" : "none",
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

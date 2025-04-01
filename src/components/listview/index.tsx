import { ContextMenuList } from "@/components/gui/context-menu-handler";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { OpenContextMenuList } from "@/core/channel-builtin";
import { cn } from "@/lib/utils";
import { Icon } from "@phosphor-icons/react";
import { LucideChevronDown, LucideChevronRight } from "lucide-react";
import React, {
  Dispatch,
  Fragment,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import HighlightText from "../ui/highlight-text";

export interface ListViewItem<T = unknown> {
  key: string;
  name: string;
  icon: Icon;
  iconColor?: string;
  iconBadgeColor?: string;
  data: T;
  badgeContent?: string;
  badgeClassName?: string;
  children?: ListViewItem<T>[];
  progressBarValue?: number;
  progressBarMax?: number;
  progressBarLabel?: string;
}

interface ListViewProps<T> {
  items: ListViewItem<T>[];
  selectedKey?: string;
  full?: boolean;
  filter?: (item: ListViewItem<T>) => boolean;
  highlight?: string;
  collapsedKeys?: Set<string>;
  onCollapsedChange?: (keys: Set<string>) => void;
  onSelectChange?: (key: string) => void;
  onDoubleClick?: (item: ListViewItem<T>) => void;
  onContextMenu?: (item?: ListViewItem<T>) => OpenContextMenuList;
}

interface ListViewRendererProps<T> extends ListViewProps<T> {
  depth: number;
  stopParentPropagation: MutableRefObject<boolean>;
  setContextMenu: Dispatch<SetStateAction<OpenContextMenuList>>;
  contextMenuKey: string;
  setContextMenuKey: Dispatch<SetStateAction<string>>;
  contextOpen: boolean;
}

function Indentation({ depth }: { depth: number }) {
  if (depth <= 0) return null;

  return new Array(depth).fill(false).map((_, idx: number) => {
    return <div key={idx} className={cn("w-4 shrink-0")}></div>;
  });
}

function CollapsedButton({
  hasCollapsed,
  collapsed,
  onClick,
}: {
  hasCollapsed: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return hasCollapsed ? (
    <div onClick={onClick}>
      {collapsed ? (
        <LucideChevronDown className={cn("h-4 w-4")} />
      ) : (
        <LucideChevronRight className={cn("h-4 w-4")} />
      )}
    </div>
  ) : (
    <div className="w-4 shrink-0"></div>
  );
}

function matchFilter<T = unknown>(
  item: ListViewItem<T>,
  filter?: (item: ListViewItem<T>) => boolean
): boolean {
  if (!filter) return true;

  return (
    filter(item) ||
    (item.children ?? []).some((child) => matchFilter(child, filter))
  );
}

function renderList<T>(props: ListViewRendererProps<T>): React.ReactElement {
  const { items, depth, ...rest } = props;
  const {
    filter,
    highlight,
    stopParentPropagation,
    onContextMenu,
    onDoubleClick,
    onSelectChange,
    selectedKey,
    setContextMenu,
    contextMenuKey,
    setContextMenuKey,
    collapsedKeys,
    onCollapsedChange,
    contextOpen,
  } = rest;

  if (items.length === 0) return <Fragment></Fragment>;
  const listCollapsed = items.some(
    (item) => item.children && item.children.length > 0
  );

  return (
    <>
      {items
        .filter((item) => matchFilter(item, filter))
        .map((item) => {
          const hasCollaped = !!item.children && item.children.length > 0;
          const isCollapsed = !!collapsedKeys && collapsedKeys.has(item.key);

          const collapsedClicked = () => {
            if (onCollapsedChange) {
              if (collapsedKeys) {
                const tmpSet = new Set(collapsedKeys);
                if (tmpSet.has(item.key)) {
                  tmpSet.delete(item.key);
                } else {
                  tmpSet.add(item.key);
                }
                onCollapsedChange(tmpSet);
              } else {
                onCollapsedChange(new Set([item.key]));
              }
            }
          };

          return (
            <React.Fragment key={item.key}>
              <div
                key={item.key}
                onContextMenu={() => {
                  stopParentPropagation.current = true;
                  setContextMenuKey(item.key);
                  if (onContextMenu) setContextMenu(onContextMenu(item));
                }}
                onDoubleClick={() => {
                  if (onDoubleClick) {
                    onDoubleClick(item);
                  }
                }}
                onClick={() => {
                  if (onSelectChange) {
                    onSelectChange(item.key);
                  }
                }}
              >
                <div
                  className={cn(
                    "flex h-8 items-center gap-0.5 px-4 text-sm text-neutral-500",
                    selectedKey === item.key
                      ? "bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900",
                    contextMenuKey === item.key && contextOpen
                      ? "border border-blue-500"
                      : "border border-transparent",
                    "w-full",
                    "justify-start",
                    "cursor-pointer"
                  )}
                >
                  <Indentation depth={depth} />
                  {(depth > 0 || listCollapsed) && (
                    <CollapsedButton
                      hasCollapsed={hasCollaped}
                      onClick={collapsedClicked}
                      collapsed={isCollapsed}
                    />
                  )}
                  {item.icon && (
                    <div className="relative mr-1 h-4 w-4 shrink-0">
                      <item.icon className={cn("h-4 w-4", item.iconColor)} />
                      {item.iconBadgeColor && (
                        <div
                          className={cn(
                            "absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full",
                            item.iconBadgeColor
                          )}
                        ></div>
                      )}
                    </div>
                  )}

                  <div className="line-clamp-1 flex-1 text-sm">
                    <HighlightText text={item.name} highlight={highlight} />
                    {item.badgeContent && (
                      <span
                        className={cn(
                          "ml-1 rounded p-0.5 px-1 font-mono text-sm font-normal",
                          item.badgeClassName ?? "bg-red-500 text-white"
                        )}
                      >
                        {item.badgeContent}
                      </span>
                    )}
                  </div>

                  {item.progressBarValue && item.progressBarMax && (
                    <div className="text-muted-foreground relative flex h-full w-[50px] items-center">
                      <div
                        className="h-[20px] rounded-sm border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                        style={{
                          width:
                            Math.max(
                              Math.ceil(
                                (item.progressBarValue / item.progressBarMax) *
                                  100
                              ),
                              5
                            ) + "%",
                        }}
                      ></div>
                      <span className="absolute right-0">
                        {item.progressBarLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isCollapsed &&
                renderList({
                  ...rest,
                  depth: depth + 1,
                  items: item.children ?? [],
                })}
            </React.Fragment>
          );
        })}
    </>
  );
}

export function ListView<T = unknown>(props: ListViewProps<T>) {
  const [contextOpen, setContextOpen] = useState(false);
  const [contextMenuKey, setContextMenuKey] = useState("");
  const [contextMenu, setContextMenu] = useState<OpenContextMenuList>([]);

  // When click on list item context menu, it will set to TRUE
  // to prevent container context menu event.
  const stopParentPropagation = useRef<boolean>(false);

  const { full, ...rest } = props;
  const { onContextMenu } = rest;

  return (
    <ContextMenu modal={false} onOpenChange={setContextOpen}>
      <ContextMenuTrigger asChild>
        <div
          tabIndex={0}
          className={cn(full ? "grow overflow-auto" : "", "select-none")}
          onContextMenu={(e) => {
            if (stopParentPropagation.current) {
              stopParentPropagation.current = false;
              return;
            }

            if (onContextMenu) {
              const menu = onContextMenu();
              if (menu.length === 0) {
                e.preventDefault();
                e.stopPropagation();
              } else {
                setContextMenu(menu);
              }
            }

            setContextMenuKey("");
          }}
        >
          <div className={"flex flex-col gap-0"}>
            {renderList({
              ...rest,
              depth: 0,
              stopParentPropagation,
              setContextMenu,
              contextMenuKey,
              contextOpen,
              setContextMenuKey,
            })}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuList menu={contextMenu} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

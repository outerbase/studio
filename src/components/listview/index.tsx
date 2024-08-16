import { ContextMenuList } from "@/components/gui/context-menu-handler";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { OpenContextMenuList } from "@/messages/open-context-menu";
import {
  LucideChevronDown,
  LucideChevronRight,
  LucideIcon,
} from "lucide-react";
import React, {
  Dispatch,
  Fragment,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";

export interface ListViewItem<T = unknown> {
  key: string;
  name: string;
  icon: LucideIcon;
  iconColor?: string;
  data: T;
  badgeContent?: string;
  badgeClassName?: string;
  children?: ListViewItem<T>[];
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

function Highlight({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <span>{text}</span>;

  const regex = new RegExp(
    "(" + (highlight ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
    "i"
  );

  const splitedText = text.split(regex);

  return (
    <span>
      {splitedText.map((text, idx) => {
        return text.toLowerCase() === (highlight ?? "").toLowerCase() ? (
          <span key={idx} className="bg-yellow-300 text-black">
            {text}
          </span>
        ) : (
          <span key={idx}>{text}</span>
        );
      })}
    </span>
  );
}

function Indentation({ depth }: { depth: number }) {
  if (depth <= 0) return null;

  return new Array(depth).fill(false).map((_, idx: number) => {
    return <div key={idx} className={cn("w-4")}></div>;
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
        <LucideChevronDown className={cn("w-4 h-4")} />
      ) : (
        <LucideChevronRight className={cn("w-4 h-4")} />
      )}
    </div>
  ) : (
    <div className="w-4"></div>
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
                    "px-2    flex text-xs items-center gap-0.5 h-8",
                    selectedKey === item.key
                      ? "bg-selected"
                      : "hover:bg-accent",
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
                    <item.icon className={cn("w-4 h-4 mr-1", item.iconColor)} />
                  )}
                  <div>
                    <Highlight text={item.name} highlight={highlight} />
                    {item.badgeContent && (
                      <span
                        className={cn(
                          "rounded p-0.5 px-1 ml-1 text-xs font-mono font-normal",
                          item.badgeClassName ?? "bg-red-500 text-white"
                        )}
                      >
                        {item.badgeContent}
                      </span>
                    )}
                  </div>
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
              if (menu.length === 0) e.preventDefault();
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

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
import {
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

function renderList<T>(props: ListViewRendererProps<T>): React.ReactElement {
  const { items, depth, ...rest } = props;
  const {
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

  return (
    <>
      {items.map((item) => {
        const isCollapsed = collapsedKeys && collapsedKeys.has(item.key);

        return (
          <>
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
                  "px-3 flex text-sm items-center gap-0.5 h-8",
                  selectedKey === item.key ? "bg-selected" : "hover:bg-accent",
                  contextMenuKey === item.key && contextOpen
                    ? "border border-blue-500"
                    : "border border-transparent",
                  "w-full",
                  "justify-start",
                  "cursor-pointer"
                )}
              >
                {depth > 0 &&
                  new Array(depth).fill(false).map((_, idx) => {
                    const hasCollaped =
                      item.children &&
                      item.children.length > 0 &&
                      idx === depth - 1;

                    return (
                      <div
                        onClick={
                          hasCollaped
                            ? () => {
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
                              }
                            : undefined
                        }
                        key={idx}
                        className={cn(
                          "w-2 border-l ml-2 mr-1 h-full border-dashed"
                        )}
                      >
                        {hasCollaped ? (
                          isCollapsed ? (
                            <LucideChevronDown
                              className={cn(
                                "w-4 h-4 -ml-2 mt-2",
                                item.iconColor
                              )}
                            />
                          ) : (
                            <LucideChevronRight
                              className={cn(
                                "w-4 h-4 -ml-2 mt-2",
                                item.iconColor
                              )}
                            />
                          )
                        ) : (
                          " "
                        )}
                      </div>
                    );
                  })}

                {item.icon && (
                  <item.icon className={cn("w-4 h-4 mr-1", item.iconColor)} />
                )}
                <div>
                  {item.name}
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
          </>
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
  const { onContextMenu, items } = rest;

  // Check if any item has children
  const hasChildren = items.some(
    (item) => item.children && item.children.length > 0
  );

  // If there is at least item with children,
  // We will add the guide line
  const startingDepth = hasChildren ? 1 : 0;

  return (
    <ContextMenu modal={false} onOpenChange={setContextOpen}>
      <ContextMenuTrigger asChild>
        <div
          tabIndex={0}
          className={cn(full ? "grow overflow-auto" : "", "select-none")}
          onContextMenu={() => {
            if (stopParentPropagation.current) {
              stopParentPropagation.current = false;
              return;
            }
            if (onContextMenu) setContextMenu(onContextMenu());
            setContextMenuKey("");
          }}
        >
          <div className={"flex flex-col gap-0"}>
            {renderList({
              ...rest,
              depth: startingDepth,
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

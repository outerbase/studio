import { ContextMenuList } from "@/components/gui/context-menu-handler";
import { buttonVariants } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { OpenContextMenuList } from "@/messages/open-context-menu";
import { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";

export interface ListViewItem<T = unknown> {
  key: string;
  name: string;
  icon: LucideIcon;
  iconColor?: string;
  data: T;
}

interface ListViewProps<T> {
  items: ListViewItem<T>[];
  selectedKey?: string;
  full?: boolean;
  onSelectChange?: (key: string) => void;
  onDoubleClick?: (item: ListViewItem<T>) => void;
  onContextMenu?: (item?: ListViewItem<T>) => OpenContextMenuList;
}

export function ListView<T = unknown>({
  items,
  selectedKey,
  onDoubleClick,
  onSelectChange,
  onContextMenu,
  full,
}: ListViewProps<T>) {
  const [contextOpen, setContextOpen] = useState(false);
  const [contextMenuKey, setContextMenuKey] = useState("");
  const [contextMenu, setContextMenu] = useState<OpenContextMenuList>([]);

  // When click on list item context menu, it will set to TRUE
  // to prevent container context menu event.
  const stopParentPropagation = useRef<boolean>(false);

  return (
    <ContextMenu modal={false} onOpenChange={setContextOpen}>
      <ContextMenuTrigger asChild>
        <div
          tabIndex={0}
          className={cn(full ? "grow overflow-auto p-2" : "p-2", "select-none")}
          onContextMenu={() => {
            if (stopParentPropagation.current) {
              stopParentPropagation.current = false;
              return;
            }
            if (onContextMenu) setContextMenu(onContextMenu());
            setContextMenuKey("");
          }}
        >
          <div className={"flex flex-col"}>
            {items.map((item) => {
              return (
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
                  className="flex p-0.5"
                >
                  <div
                    className={cn(
                      buttonVariants({
                        variant: selectedKey === item.key ? "default" : "ghost",
                        size: "sm",
                      }),
                      contextMenuKey === item.key && contextOpen
                        ? "border border-blue-500"
                        : "border border-transparent",
                      "w-full",
                      "justify-start",
                      "cursor-pointer"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("w-4 h-4 mr-2", item.iconColor)}
                      />
                    )}
                    {item.name}
                  </div>
                </div>
              );
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

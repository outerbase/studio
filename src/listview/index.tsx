import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
  onContextMenu?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item?: ListViewItem<T>
  ) => void;
}

export function ListView<T = unknown>({
  items,
  selectedKey,
  onDoubleClick,
  onSelectChange,
  onContextMenu,
  full,
}: ListViewProps<T>) {
  return (
    <div
      className={full ? "grow overflow-auto p-2" : "p-2"}
      onContextMenu={(e) => {
        if (onContextMenu) onContextMenu(e);
      }}
    >
      <div className={"flex flex-col"}>
        {items.map((item) => {
          return (
            <div
              key={item.key}
              onContextMenu={(e) => {
                if (onContextMenu) onContextMenu(e, item);
              }}
              onDoubleClick={() => {
                if (onDoubleClick) {
                  onDoubleClick(item);
                }
              }}
              onMouseDown={() => {
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
                  "w-full",
                  "justify-start",
                  "cursor-pointer"
                )}
              >
                {item.icon && (
                  <item.icon className={cn("w-4 h-4 mr-2", item.iconColor)} />
                )}
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

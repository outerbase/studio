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
  onSelectChange?: (key: string) => void;
  onDoubleClick?: (item: ListViewItem<T>) => void;
}

export function ListView<T = unknown>({
  items,
  selectedKey,
  onDoubleClick,
  onSelectChange,
}: ListViewProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        return (
          <div
            key={item.key}
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
            className={cn(
              buttonVariants({
                variant: selectedKey === item.key ? "default" : "ghost",
                size: "sm",
              }),
              "justify-start",
              "cursor-pointer"
            )}
          >
            {item.icon && (
              <item.icon className={cn("w-4 h-4 mr-2", item.iconColor)} />
            )}
            {item.name}
          </div>
        );
      })}
    </div>
  );
}

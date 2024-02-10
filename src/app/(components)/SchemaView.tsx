import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { openTabs } from "@/messages/openTabs";
import { LucideIcon, Table2 } from "lucide-react";
import { useCallback, useState } from "react";
import {
  OpenContextMenuList,
  openContextMenuFromEvent,
} from "@/messages/openContextMenu";
import { useSchema } from "@/screens/DatabaseScreen/SchemaProvider";

interface SchemaViewItemProps {
  icon: LucideIcon;
  title: string;
  selected: boolean;
  onClick: () => void;
  onContextMenu: React.MouseEventHandler;
}

function SchemaViewmItem({
  icon: Icon,
  title,
  onClick,
  selected,
  onContextMenu,
}: SchemaViewItemProps) {
  return (
    <div
      onMouseDown={onClick}
      onContextMenu={(e) => {
        onContextMenu(e);
        onClick();
      }}
      onDoubleClick={() => {
        openTabs({
          key: "table_" + title,
          name: title,
          type: "table",
          tableName: title,
        });
      }}
      className={cn(
        buttonVariants({
          variant: selected ? "default" : "ghost",
          size: "sm",
        }),
        "justify-start",
        "cursor-pointer"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {title}
    </div>
  );
}

export default function SchemaView() {
  const { refresh, schema } = useSchema();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const prepareContextMenu = useCallback(
    (tableName?: string) => {
      return [
        {
          title: "Copy Name",
          disabled: !tableName,
          onClick: () => {
            window.navigator.clipboard.writeText(tableName ?? "");
          },
        },
        { separator: true },
        { title: "Refresh", onClick: () => refresh() },
      ] as OpenContextMenuList;
    },
    [refresh]
  );

  return (
    <ScrollArea
      className="h-full select-none"
      onContextMenu={openContextMenuFromEvent(prepareContextMenu())}
    >
      <div className="flex flex-col p-2 pr-4">
        {schema.map((item, schemaIndex) => {
          return (
            <SchemaViewmItem
              onContextMenu={openContextMenuFromEvent(
                prepareContextMenu(item.name)
              )}
              key={item.name}
              title={item.name}
              icon={Table2}
              selected={schemaIndex === selectedIndex}
              onClick={() => setSelectedIndex(schemaIndex)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}

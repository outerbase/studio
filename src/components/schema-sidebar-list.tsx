import { ScrollArea } from "./ui/scroll-area";
import { openTabs } from "@/messages/openTabs";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Table2 } from "lucide-react";
import {
  OpenContextMenuList,
  openContextMenuFromEvent,
} from "@/messages/openContextMenu";
import { useSchema } from "@/context/SchemaProvider";
import { useCallback, useEffect, useState } from "react";

interface SchemaListProps {
  search: string;
}

interface SchemaViewItemProps {
  icon: LucideIcon;
  title: string;
  selected: boolean;
  onClick: () => void;
  onContextMenu: React.MouseEventHandler;
}

function SchemaViewItem({
  icon: Icon,
  title,
  onClick,
  selected,
  onContextMenu,
}: Readonly<SchemaViewItemProps>) {
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

export default function SchemaList({ search }: Readonly<SchemaListProps>) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { refresh, schema } = useSchema();

  useEffect(() => {
    setSelectedIndex(-1);
  }, [setSelectedIndex, search]);

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
        {
          title: "Create New Table",
          onClick: () => {
            openTabs({
              key: "_create_schema",
              name: "Create Table",
              type: "schema",
            });
          },
        },
        {
          title: "Edit Table",
          disabled: !tableName,
          onClick: () => {
            openTabs({
              key: "_schema_" + tableName,
              name: "Edit " + tableName,
              tableName,
              type: "schema",
            });
          },
        },
        { separator: true },
        { title: "Refresh", onClick: () => refresh() },
      ] as OpenContextMenuList;
    },
    [refresh]
  );

  const filteredSchema = schema.filter((s) => {
    return s.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  });

  return (
    <ScrollArea
      className="flex-grow select-none"
      onContextMenu={openContextMenuFromEvent(prepareContextMenu())}
    >
      <div className="flex flex-col p-2 pr-4">
        {filteredSchema.map((item, schemaIndex) => {
          return (
            <SchemaViewItem
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

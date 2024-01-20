import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoComplete } from "@/context/AutoCompleteProvider";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { DatabaseSchemaItem } from "@/drivers/DatabaseDriver";
import { cn } from "@/lib/utils";
import { openTabs } from "@/messages/openTabs";
import { LucideIcon, Table2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  OpenContextMenuList,
  openContextMenuFromEvent,
} from "@/messages/openContextMenu";
import OpacityLoading from "./OpacityLoading";

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
  const { updateTableList } = useAutoComplete();
  const [schemaItems, setSchemaItems] = useState<DatabaseSchemaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { databaseDriver } = useDatabaseDriver();

  const fetchSchema = useCallback(() => {
    setLoading(true);

    databaseDriver.getTableList().then((tableList) => {
      const sortedTableList = [...tableList];
      sortedTableList.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      setSchemaItems(sortedTableList);
      updateTableList(tableList.map((table) => table.name));
      setLoading(false);
    });
  }, [databaseDriver, updateTableList]);

  const prepareContextMenu = useCallback(
    (tableName?: string) => {
      return [
        { title: "Copy Name", disabled: !tableName },
        { separator: true },
        { title: "Refresh", onClick: fetchSchema },
      ] as OpenContextMenuList;
    },
    [fetchSchema]
  );

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  return (
    <ScrollArea
      className="h-full select-none"
      onContextMenu={openContextMenuFromEvent(prepareContextMenu())}
    >
      {loading && <OpacityLoading />}
      <div className="flex flex-col p-2 pr-4">
        {schemaItems.map((item, schemaIndex) => {
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

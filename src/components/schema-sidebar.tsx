import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { openTabs } from "@/messages/openTabs";
import {
  LucideIcon,
  LucideSearch,
  LucideSun,
  LucideSunMoon,
  Table2,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  OpenContextMenuList,
  openContextMenuFromEvent,
} from "@/messages/openContextMenu";
import { useSchema } from "@/context/SchemaProvider";
import { appVersion } from "@/env";
import { useTheme } from "@/context/theme-provider";

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
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="pt-2 px-2 flex h-10">
        <div className="bg-secondary rounded overflow-hidden flex items-center ml-3 flex-grow">
          <div className="text-sm px-2 h-full flex items-center">
            <LucideSearch className="h-4 w-4 text-black" />
          </div>
          <input
            type="text"
            className="bg-inherit p-1 pl-2 pr-2 outline-none text-sm  h-full flex-grow"
            value={search}
            placeholder="Search table"
            onChange={(e) => {
              setSelectedIndex(-1);
              setSearch(e.currentTarget.value);
            }}
          />
        </div>
      </div>
      <ScrollArea
        className="flex-grow select-none"
        onContextMenu={openContextMenuFromEvent(prepareContextMenu())}
      >
        <div className="flex flex-col p-2 pr-4">
          {schema
            .filter((s) => {
              return s.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
            })
            .map((item, schemaIndex) => {
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
      <div className="bg-blue-700 h-8 flex items-center px-2 text-white">
        <span>LibSQL</span>
        <strong>Studio</strong>
        <span className="text-xs ml-2">v{appVersion}</span>
        <div className="grow" />
        <div
          role="button"
          className="px-2 flex items-center h-full -mr-2"
          tabIndex={-1}
          onClick={() => {
            toggleTheme();
          }}
        >
          {theme === "dark" ? (
            <LucideSun className="w-4 h-4" />
          ) : (
            <LucideSunMoon className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}

import { ScrollArea } from "../ui/scroll-area";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { LucideCog, LucideIcon, LucideView, Table2 } from "lucide-react";
import {
  OpenContextMenuList,
  openContextMenuFromEvent,
} from "@/messages/open-context-menu";
import { useCallback, useEffect, useMemo, useState } from "react";
import { openTab } from "@/messages/open-tab";
import { DatabaseSchemaItem } from "@/drivers/base-driver";
import { useSchema } from "@/context/schema-provider";

interface SchemaListProps {
  search: string;
}

type DatabaseSchemaItemWithIndentation = DatabaseSchemaItem & {
  indentation?: number;
};

type DatabaseSchemaTreeNode = {
  node: DatabaseSchemaItemWithIndentation;
  sub: DatabaseSchemaItemWithIndentation[];
};

interface SchemaViewItemProps {
  item: DatabaseSchemaItem;
  highlight?: string;
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  selected: boolean;
  onClick: () => void;
  onContextMenu: React.MouseEventHandler;
  indentation?: boolean;
  badge?: string;
}

function SchemaViewItem({
  icon: Icon,
  iconClassName,
  title,
  onClick,
  highlight,
  selected,
  onContextMenu,
  indentation,
  item,
  badge,
}: Readonly<SchemaViewItemProps>) {
  const regex = new RegExp(
    "(" + (highlight ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
    "i"
  );

  const splitedText = title.split(regex);

  return (
    <div
      onMouseDown={onClick}
      onContextMenu={(e) => {
        onContextMenu(e);
        onClick();
      }}
      onDoubleClick={() => {
        if (item.type === "table" || item.type === "view") {
          openTab({
            type: "table",
            tableName: title,
          });
        } else if (item.type === "trigger") {
          openTab({
            type: "trigger",
            name: item.name,
          });
        }
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
      {indentation && (
        <div className="w-2 border-l ml-2  2 h-full border-dashed"></div>
      )}
      <Icon className={cn("mr-2 h-4 w-4", selected ? "" : iconClassName)} />

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

        {badge && (
          <span className="bg-red-500 text-white rounded p-0.5 px-1 ml-1 text-xs font-mono font-normal">
            {badge}
          </span>
        )}
      </span>
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
    (item?: DatabaseSchemaItem) => {
      const selectedName = item?.name;
      const isTable = item?.type === "table";

      return [
        {
          title: "Copy Name",
          disabled: !selectedName,
          onClick: () => {
            window.navigator.clipboard.writeText(selectedName ?? "");
          },
        },
        { separator: true },
        {
          title: "Create New Table",
          onClick: () => {
            openTab({
              type: "schema",
            });
          },
        },
        isTable
          ? {
              title: "Edit Table",
              onClick: () => {
                openTab({
                  tableName: item?.name,
                  type: "schema",
                });
              },
            }
          : undefined,
        { separator: true },
        { title: "Refresh", onClick: () => refresh() },
      ].filter(Boolean) as OpenContextMenuList;
    },
    [refresh]
  );

  const filteredSchema = useMemo(() => {
    // Build the tree first then we can flat it
    let tree: DatabaseSchemaTreeNode[] = [];
    const treeHash: Record<string, DatabaseSchemaTreeNode> = {};

    const excludeTables = new Set();
    const ftsTables: string[] = [];
    const ftsSuffix = ["_config", "_content", "_data", "_docsize", "_idx"];

    // Scan for FTS5
    for (const item of schema) {
      if (item.name && item.tableSchema?.fts5) {
        const tableName = item.name;
        ftsTables.push(tableName);
        for (const suffix of ftsSuffix) {
          excludeTables.add(tableName + suffix);
        }
      }
    }

    for (const item of schema) {
      if (item.type === "table" || item.type === "view") {
        const node = { node: item, sub: [] };
        treeHash[item.name] = node;

        if (item.name && !excludeTables.has(item.name)) {
          tree.push(node);
        }
      }
    }

    // Grouping FTS5 table
    for (const ftsTableName of ftsTables) {
      const ftsSubgroup = treeHash[ftsTableName].sub;
      if (ftsSubgroup) {
        for (const suffix of ftsSuffix) {
          const ftsSubTable = treeHash[ftsTableName + suffix];
          if (ftsSubTable) {
            treeHash[ftsTableName].sub.push(ftsSubTable.node);
          }
        }
      }
    }

    for (const item of schema) {
      if (item.type === "trigger" && item.tableName) {
        if (treeHash[item.tableName]) {
          treeHash[item.tableName]?.sub.push(item);
        }
      }
    }

    tree = tree.filter((s) => {
      const foundName =
        s.node.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      const foundInChildren =
        s.sub.filter(
          (c) => c.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
        ).length > 0;
      return foundName || foundInChildren;
    });

    return tree
      .map((r) => [r.node, ...r.sub.map((d) => ({ ...d, indentation: 1 }))])
      .flat();
  }, [schema, search]);

  return (
    <ScrollArea
      className="grow select-none"
      onContextMenu={(e) =>
        openContextMenuFromEvent(
          prepareContextMenu(
            selectedIndex && schema[selectedIndex]
              ? schema[selectedIndex]
              : undefined
          )
        )(e)
      }
    >
      <div className="flex flex-col p-2 pr-4">
        {filteredSchema.map((item, schemaIndex) => {
          let icon = Table2;
          let iconClassName = "text-blue-600 dark:text-blue-300";
          if (item.type === "trigger") {
            icon = LucideCog;
            iconClassName = "text-purple-500";
          } else if (item.type === "view") {
            icon = LucideView;
            iconClassName = "text-green-600 dark:text-green-300";
          }

          return (
            <SchemaViewItem
              highlight={search}
              item={item}
              onContextMenu={(e) => {
                openContextMenuFromEvent(prepareContextMenu(item))(e);
                e.stopPropagation();
              }}
              key={item.name}
              title={item.name}
              iconClassName={iconClassName}
              icon={icon}
              indentation={!!item.indentation}
              selected={schemaIndex === selectedIndex}
              onClick={() => setSelectedIndex(schemaIndex)}
              badge={item.tableSchema?.fts5 ? "fts5" : undefined}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}

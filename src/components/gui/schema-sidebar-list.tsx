import { LucideCog, LucideDatabase, LucideView } from "lucide-react";
import { OpenContextMenuList } from "@/messages/open-context-menu";
import { useCallback, useEffect, useMemo, useState } from "react";
import { openTab } from "@/messages/open-tab";
import { DatabaseSchemaItem } from "@/drivers/base-driver";
import { useSchema } from "@/context/schema-provider";
import { ListView, ListViewItem } from "../listview";
import { useDatabaseDriver } from "@/context/driver-provider";
import { Table } from "@phosphor-icons/react";
import SchemaCreateDialog from "./schema-editor/schema-create";

interface SchemaListProps {
  search: string;
}

function formatTableSize(byteCount?: number) {
  const byteInKb = 1024;
  const byteInMb = byteInKb * 1024;
  const byteInGb = byteInMb * 1024;

  if (!byteCount) return undefined;
  if (byteInMb * 999 < byteCount)
    return (byteCount / byteInGb).toFixed(1) + " GB";
  if (byteInMb * 100 < byteCount)
    return (byteCount / byteInMb).toFixed(0) + " MB";
  if (byteInKb * 100 < byteCount)
    return (byteCount / byteInMb).toFixed(1) + " MB";
  if (byteInKb < byteCount) return Math.floor(byteCount / byteInKb) + " KB";
  return "1 KB";
}

function prepareListViewItem(
  schema: DatabaseSchemaItem[],
  maxTableSize: number
): ListViewItem<DatabaseSchemaItem>[] {
  return schema.map((s) => {
    let icon = Table;
    let iconClassName = "";

    if (s.type === "trigger") {
      icon = LucideCog;
      iconClassName = "text-purple-500";
    } else if (s.type === "view") {
      icon = LucideView;
      iconClassName = "text-green-600 dark:text-green-300";
    }

    return {
      data: s,
      icon: icon,
      iconColor: iconClassName,
      key: s.schemaName + "." + s.name,
      name: s.name,
      progressBarMax: maxTableSize,
      progressBarValue: s.tableSchema?.stats?.sizeInByte,
      progressBarLabel: formatTableSize(s.tableSchema?.stats?.sizeInByte),
    };
  });
}

function groupTriggerByTable(
  items: ListViewItem<DatabaseSchemaItem>[]
): ListViewItem<DatabaseSchemaItem>[] {
  // Find all triggers
  const triggers = items.filter((item) => item.data.type === "trigger");
  const triggerByTable = triggers.reduce(
    (a, b) => {
      a[b.data.tableName ?? ""] = [...(a[b.data.tableName ?? ""] ?? []), b];
      return a;
    },
    {} as Record<string, ListViewItem<DatabaseSchemaItem>[]>
  );

  const list = items.filter((item) => item.data.type !== "trigger");
  for (const item of list) {
    if (item.data.type === "table" && triggerByTable[item.data.name]) {
      item.children = [
        ...(item.children ?? []),
        ...(triggerByTable[item.name] ?? []),
      ];
    }
  }

  return list;
}

function groupByFtsTable(items: ListViewItem<DatabaseSchemaItem>[]) {
  const hash = items.reduce(
    (a, b) => {
      a[b.name] = b;
      return a;
    },
    {} as Record<string, ListViewItem<DatabaseSchemaItem>>
  );
  const ftsSuffix = ["_config", "_content", "_data", "_docsize", "_idx"];
  const excludes = new Set();

  for (const item of items) {
    if (item.data.tableSchema?.fts5) {
      item.children = ftsSuffix
        .map((suffix) => hash[item.data.name + suffix])
        .filter(Boolean);

      ftsSuffix.forEach((suffix) => excludes.add(item.data.name + suffix));

      item.badgeContent = "fts5";
    }
  }

  return items.filter((item) => !excludes.has(item.data.name));
}

function sortTable(items: ListViewItem<DatabaseSchemaItem>[]) {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

function flattenSchemaGroup(
  schemaGroup: ListViewItem<DatabaseSchemaItem>[]
): ListViewItem<DatabaseSchemaItem>[] {
  if (schemaGroup.length === 1) return schemaGroup[0].children ?? [];
  return schemaGroup;
}

export default function SchemaList({ search }: Readonly<SchemaListProps>) {
  const { databaseDriver } = useDatabaseDriver();
  const [selected, setSelected] = useState("");
  const { refresh, schema, currentSchemaName } = useSchema();
  const [editSchema, setEditSchema] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState(() => {
    return new Set<string>();
  });

  useEffect(() => {
    setSelected("");
  }, [setSelected, search]);

  const prepareContextMenu = useCallback(
    (item?: DatabaseSchemaItem) => {
      const selectedName = item?.name;
      const isTable = item?.type === "table";
      const isTrigger = item?.type === "trigger";

      return [
        {
          title: "Copy Name",
          disabled: !selectedName,
          onClick: () => {
            window.navigator.clipboard.writeText(selectedName ?? "");
          },
        },
        { separator: true },
        databaseDriver.getFlags().supportCreateUpdateTable && {
          title: "Create New Table",
          onClick: () => {
            openTab({
              type: "schema",
              schemaName: item?.schemaName ?? currentSchemaName,
            });
          },
        },
        isTable && databaseDriver.getFlags().supportCreateUpdateTable
          ? {
            title: "Edit Table",
            onClick: () => {
              openTab({
                tableName: item?.name,
                type: "schema",
                schemaName: item?.schemaName ?? "",
              });
            },
          }
          : undefined,
        databaseDriver.getFlags().supportCreateUpdateTrigger ? { separator: true } : undefined,
        databaseDriver.getFlags().supportCreateUpdateTrigger ? {
          title: isTrigger ? "Edit Trigger" : "Create New Trigger",
          onClick: () => {
            openTab({
              type: "trigger",
              schemaName: item?.schemaName ?? currentSchemaName,
              name: isTrigger ? item.name : 'create',
              tableName: item?.tableSchema?.tableName
            });
          }
        } : undefined,
        databaseDriver.getFlags().supportCreateUpdateTable
          ? { separator: true }
          : undefined,
        { title: "Refresh", onClick: () => refresh() },
      ].filter(Boolean) as OpenContextMenuList;
    },
    [refresh, databaseDriver, currentSchemaName]
  );

  const listViewItems = useMemo(() => {
    const r = sortTable(
      Object.entries(schema).map(([s, tables]) => {
        const maxTableSize = Math.max(
          ...tables.map((t) => t.tableSchema?.stats?.sizeInByte ?? 0)
        );

        return {
          data: { type: "schema", schemaName: s },
          icon: LucideDatabase,
          name: s,
          iconBadgeColor: s === currentSchemaName ? "bg-green-600" : undefined,
          key: s.toString(),
          children: sortTable(
            groupByFtsTable(
              groupTriggerByTable(prepareListViewItem(tables, maxTableSize))
            )
          ),
        } as ListViewItem<DatabaseSchemaItem>;
      })
    );

    if (databaseDriver.getFlags().optionalSchema) {
      // For SQLite, the default schema is main and
      // it is optional.
      return flattenSchemaGroup(r);
    }
    return r;
  }, [schema, currentSchemaName, databaseDriver]);

  const filterCallback = useCallback(
    (item: ListViewItem<DatabaseSchemaItem>) => {
      if (!search) return true;
      return item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
    },
    [search]
  );

  return (
    <>
      {editSchema && (
        <SchemaCreateDialog
          schemaName={editSchema}
          onClose={() => setEditSchema(null)}
        />
      )}
      <ListView
        full
        filter={filterCallback}
        highlight={search}
        items={listViewItems}
        collapsedKeys={collapsed}
        onCollapsedChange={setCollapsed}
        onContextMenu={(item) => prepareContextMenu(item?.data)}
        selectedKey={selected}
        onSelectChange={setSelected}
        onDoubleClick={(item) => {
          if (item.data.type === "table" || item.data.type === "view") {
            openTab({
              type: "table",
              schemaName: item.data.schemaName ?? "",
              tableName: item.data.name,
            });
          } else if (item.data.type === "trigger") {
            openTab({
              type: "trigger",
              schemaName: item.data.schemaName,
              name: item.name,
            });
          } else if (item.data.type === "schema") {
            if (databaseDriver.getFlags().supportUseStatement) {
              databaseDriver
                .query("USE " + databaseDriver.escapeId(item.name))
                .then(() => {
                  refresh();
                });
            }
          }
        }}
      />
    </>
  );
}

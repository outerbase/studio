"use client";
import { ListView, ListViewItem } from "@/components/listview";
import { Input } from "@/components/ui/input";
import { LucideDatabase, LucideTable } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function Demo1() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState(new Set<string>(["movies"]));

  const filterCallback = useCallback(
    (item: ListViewItem<unknown>) => {
      if (filter === "") return true;
      return item.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    },
    [filter]
  );

  const items = useMemo(() => {
    return [
      {
        key: "movies",
        data: {},
        name: "movies",
        icon: LucideDatabase,
        children: [
          {
            name: "movies",
            key: "movies.movies",
            icon: LucideTable,
            progressBarLabel: "1.3GB",
            progressBarValue: 9050,
            progressBarMax: 10000,
          },
          {
            name: "users",
            badgeContent: "fts5",
            badgeClassName: "bg-red-500 text-white",
            key: "movies.users",
            progressBarLabel: "1.5KB",
            progressBarValue: 1500,
            progressBarMax: 10000,
            icon: LucideTable,
            children: [
              {
                name: "insert_movies",
                key: "movies.insert_movies",
                icon: LucideTable,
              },
              {
                name: "update_movies",
                key: "movies.update_users",
                icon: LucideTable,
              },
              {
                name: "delete_movies",
                key: "movies.delete_movies",
                icon: LucideTable,
              },
            ],
          },
          {
            name: "reviews",
            key: "movies.reviews",
            icon: LucideTable,
            progressBarLabel: "256KB",
            progressBarValue: 5550,
            progressBarMax: 10000,
          },
        ],
      },
      {
        key: "resturants",
        data: {},
        name: "resturants",
        icon: LucideDatabase,
      },
      {
        key: "hotel",
        data: {},
        name: "hotel",
        icon: LucideDatabase,
      },
    ] as ListViewItem<unknown>[];
  }, []);

  return (
    <div className="w-[300px] border p-2 rounded">
      <Input
        className="mb-2"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <ListView
        filter={filterCallback}
        highlight={filter}
        items={items}
        collapsedKeys={collapsed}
        onCollapsedChange={setCollapsed}
        selectedKey={selected}
        onSelectChange={setSelected}
      />
    </div>
  );
}

function Demo2() {
  return (
    <div className="w-[300px] border p-2 rounded">
      <ListView
        items={[
          {
            name: "insert_movies",
            key: "movies.insert_movies",
            icon: LucideTable,
            data: {},
          },
          {
            name: "update_movies",
            key: "movies.update_users",
            icon: LucideTable,
            data: {},
          },
          {
            name: "delete_movies",
            key: "movies.delete_movies",
            icon: LucideTable,
            data: {},
          },
        ]}
      />
    </div>
  );
}

export default function ListViewStorybookPage() {
  return (
    <body className="p-4">
      <Demo1 />
      <br />
      <Demo2 />
    </body>
  );
}

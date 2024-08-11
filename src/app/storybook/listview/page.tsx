"use client";
import { ListView, ListViewItem } from "@/components/listview";
import { LucideDatabase, LucideTable } from "lucide-react";
import { useMemo, useState } from "react";

export default function ListViewStorybookPage() {
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState(new Set<string>(["movies"]));

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
          },
          {
            name: "users",
            badgeContent: "fts5",
            badgeClassName: "bg-red-500 text-white",
            key: "movies.users",
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
          { name: "reviews", key: "movies.reviews", icon: LucideTable },
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
    <body>
      <div className="w-[300px] border-r">
        <ListView
          items={items}
          collapsedKeys={collapsed}
          onCollapsedChange={setCollapsed}
          selectedKey={selected}
          onSelectChange={setSelected}
        />
      </div>
      <br />
      <div className="w-[300px] border-r">
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
    </body>
  );
}

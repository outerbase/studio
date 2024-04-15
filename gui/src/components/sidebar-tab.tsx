import { useConfig } from "@/contexts/config-provider";
import { useTheme } from "@/contexts/theme-provider";
import { cn } from "@/lib/utils";
import {
  LucideArrowLeft,
  LucideIcon,
  LucideMoon,
  LucideSun,
} from "lucide-react";
import Link from "next/link";
import { ReactElement, useState } from "react";

export interface SidebarTabItem {
  key: string;
  icon: LucideIcon;
  name: string;
  content: ReactElement;
}

interface SidebarTabProps {
  tabs: SidebarTabItem[];
}

export default function SidebarTab({ tabs }: Readonly<SidebarTabProps>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [loadedIndex, setLoadedIndex] = useState(() => {
    const a: boolean[] = new Array(tabs.length).fill(false);
    a[0] = true;
    return a;
  });

  const config = useConfig();
  const color = config.color;

  let bgColor = "bg-blue-500 dark:bg-blue-700";
  let textColor = "text-white";

  if (color === "red") {
    bgColor = "bg-red-500 dark:bg-red-700";
  } else if (color === "yellow") {
    bgColor = "bg-yellow-400 dark:bg-yellow-500";
    textColor = "text-black";
  } else if (color === "green") {
    bgColor = "bg-green-500 dark:bg-green-600";
  } else if (color === "gray") {
    bgColor = "bg-gray-500 dark:bg-gray-800";
  }

  return (
    <div className="flex h-full">
      <div className={cn("shrink-0 flex flex-col gap-2 pt-6", bgColor)}>
        {tabs.map(({ key, name, icon: Icon }, idx) => {
          return (
            <button
              title={name}
              key={key}
              onClick={() => {
                if (!loadedIndex[idx]) {
                  loadedIndex[idx] = true;
                  setLoadedIndex([...loadedIndex]);
                }

                if (idx !== selectedIndex) {
                  setSelectedIndex(idx);
                }
              }}
              className={
                idx === selectedIndex
                  ? "p-2 bg-background cursor-pointer"
                  : cn("p-2 cursor cursor-pointer", textColor)
              }
            >
              <Icon className="w-7 h-7" />
            </button>
          );
        })}

        <div className="grow" />

        <Link href="/connect">
          <button className={cn("p-2 cursor-pointer", bgColor)}>
            <LucideArrowLeft className={cn("w-7 h-7", textColor)} />
          </button>
        </Link>

        <button
          className="p-2 rounded-lg mb-2 cursor-pointer"
          onClick={() => toggleTheme()}
        >
          {theme === "dark" ? (
            <LucideMoon className={cn("w-7 h-7", textColor)} />
          ) : (
            <LucideSun className={cn("w-7 h-7", textColor)} />
          )}
        </button>
      </div>
      <div className="relative flex h-full grow overflow-hidden">
        {tabs.map((tab, tabIndex) => {
          const selected = selectedIndex === tabIndex;

          return (
            <div
              key={tab.key}
              style={{
                contentVisibility: selected ? "auto" : "hidden",
                zIndex: selected ? 1 : 0,
                position: "absolute",
                display: "flex",
                left: 0,
                right: 5,
                bottom: 0,
                top: 0,
              }}
            >
              {loadedIndex[tabIndex] && tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useConfig } from "@/context/config-provider";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import {
  LucideChevronLeft,
  LucideIcon,
  LucideMoon,
  LucideSun,
} from "lucide-react";
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
  const { theme, toggleTheme, disableToggle } = useTheme();
  const [loadedIndex, setLoadedIndex] = useState(() => {
    const a: boolean[] = new Array(tabs.length).fill(false);
    a[0] = true;
    return a;
  });

  const config = useConfig();

  const color = config.color;
  let bgPrimary = "border-l-gray-500 dark:border-l-gray-600";

  if (color === "red") {
    bgPrimary = "border-l-red-500 dark:border-l-red-600";
  } else if (color === "yellow") {
    bgPrimary = "border-l-yellow-500 dark:border-l-yellow-600";
  } else if (color === "green") {
    bgPrimary = "border-l-green-500 dark:border-l-green-600";
  } else if (color === "gray") {
    bgPrimary = "border-l-gray-500 dark:border-l-gray-600";
  }

  return (
    <div className={cn("flex flex-col h-full border-l-8", bgPrimary)}>
      <div className={cn("shrink-0 bg-secondary")}>
        <div className="text-sm my-2 px-3 font-semibold flex">
          {config.onBack && (
            <div
              className="flex items-center -ml-2 mr-2 cursor-pointer hover:text-blue-500"
              onClick={config.onBack}
            >
              <LucideChevronLeft />
            </div>
          )}

          <div className="flex-grow flex items-center">
            <div className="line-clamp-1 text-ellipsis">{config.name}</div>
          </div>

          {!disableToggle && (
            <div className="flex justify-center items-center">
              <button
                onClick={() => toggleTheme()}
                className="text-xs font-normal flex gap-0.5 border rounded px-2 py-1 bg-background"
              >
                {theme === "dark" ? (
                  <>
                    <LucideMoon className={cn("w-4 h-4")} />
                    Dark
                  </>
                ) : (
                  <>
                    <LucideSun className={cn("w-4 h-4")} />
                    Light
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {config.sideBarFooterComponent && (
          <div>{config.sideBarFooterComponent}</div>
        )}

        <div className="flex flex-row">
          <div className="w-2 border-b" />
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
                className={cn(
                  "cursor cursor-pointer w-[58px] h-[50px] flex flex-col gap-0.5 justify-center items-center rounded-t",
                  selectedIndex !== idx ? "border-b" : undefined,
                  selectedIndex === idx
                    ? "bg-background border-l border-r border-t"
                    : undefined
                )}
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontSize: 10 }}>{name}</span>
              </button>
            );
          })}
          <div className="flex-grow border-b" />
        </div>
      </div>
      <div className="relative flex h-full grow overflow-hidden">
        {tabs.map((tab, tabIndex) => {
          const selected = selectedIndex === tabIndex;

          return (
            <div
              key={tab.key}
              style={{
                contentVisibility: selected ? "auto" : "hidden",
                zIndex: selected ? 0 : -1,
                position: "absolute",
                display: "flex",
                left: 0,
                right: 0,
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

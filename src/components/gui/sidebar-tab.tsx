import { useConfig } from "@/context/config-provider";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import { ReactElement, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

export interface SidebarTabItem {
  key: string;
  icon: ReactElement;
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
    <div className={cn("flex h-full border-l-8", bgPrimary)}>
      <div className={cn("shrink-0")}>
        {/* <div className="text-sm my-2 px-3 font-semibold flex">
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
        </div> */}

        <div className="flex flex-col border-r h-full p-2 gap-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="h-12 w-12 flex justify-center items-center">
                <svg
                  fill="currentColor"
                  viewBox="75 75 350 350"
                  className="cursor-pointer text-black dark:text-white h-10 w-10"
                >
                  <path d="M249.51,146.58c-58.7,0-106.45,49.37-106.45,110.04c0,60.68,47.76,110.04,106.45,110.04 c58.7,0,106.46-49.37,106.46-110.04C355.97,195.95,308.21,146.58,249.51,146.58z M289.08,332.41l-0.02,0.04l-0.51,0.65 c-5.55,7.06-12.37,9.35-17.11,10.02c-1.23,0.17-2.5,0.26-3.78,0.26c-12.94,0-25.96-9.09-37.67-26.29 c-9.56-14.05-17.84-32.77-23.32-52.71c-9.78-35.61-8.67-68.08,2.83-82.74c5.56-7.07,12.37-9.35,17.11-10.02 c13.46-1.88,27.16,6.2,39.64,23.41c10.29,14.19,19.22,33.83,25.12,55.32C301,285.35,300.08,317.46,289.08,332.41z"></path>
                </svg>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="max-w-[300px] text-md">
                <h2>Welcome to</h2>
                <h1 className="text-lg -mt-1 font-bold">Outerbase Studio</h1>
                <p className="mt-2">
                  Outerbase Studio is a lightweight graphical database client.
                  <strong>
                    Your credentials and data remain fully secure with your
                    database provider
                  </strong>
                  , as none of your data passes through our servers.
                </p>

                <div className="mt-4 mb-2">
                  <Link href="#" className="text-blue-600 underline mr-2">
                    Learn More
                  </Link>
                  <Link href="#" className="text-blue-600 underline">
                    Learn More
                  </Link>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {tabs.map(({ key, name, icon }, idx) => {
            return (
              <Tooltip key={key}>
                <TooltipTrigger>
                  <button
                    title={name}
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
                      "cursor cursor-pointer h-12 w-12 flex flex-col gap-0.5 justify-center items-center rounded-t hover:text-primary",
                      selectedIndex === idx
                        ? "bg-secondary rounded-lg text-primary"
                        : undefined
                    )}
                  >
                    {icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{name}</TooltipContent>
              </Tooltip>
            );
          })}
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

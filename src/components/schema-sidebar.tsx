import { LucidePlus, LucideSearch } from "lucide-react";
import { useCallback, useState } from "react";
import SchemaList from "./schema-sidebar-list";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { openTabs } from "@/messages/openTabs";

export default function SchemaView() {
  const [search, setSearch] = useState("");

  const onNewTable = useCallback(() => {
    openTabs({
      key: "_create_schema",
      name: "Create Table",
      type: "schema",
    });
  }, []);

  return (
    <div className="flex flex-col overflow-hidden flex-grow">
      <div className="pt-2 px-2 flex h-10 -ml-3">
        <div className="bg-secondary rounded overflow-hidden flex items-center ml-3 flex-grow">
          <div className="text-sm px-2 h-full flex items-center">
            <LucideSearch className="h-4 w-4 text-black dark:text-white" />
          </div>
          <input
            type="text"
            className="bg-inherit p-1 pl-2 pr-2 outline-none text-sm  h-full flex-grow"
            value={search}
            placeholder="Search table"
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </div>
      </div>

      <SchemaList search={search} />

      <div className="p-1 px-2 mb-1">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "sm",
                }),
                "px-2 py-0 h-7"
              )}
            >
              <LucidePlus className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuItem onClick={onNewTable}>New Table</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

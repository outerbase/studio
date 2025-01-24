import { LucideSearch } from "lucide-react";
import { useMemo, useState } from "react";
import SchemaList from "./schema-sidebar-list";
import { useSchema } from "@/context/schema-provider";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Plus } from "@phosphor-icons/react";
import { useDatabaseDriver } from "@/context/driver-provider";
import SchemaCreateDialog from "./schema-editor/schema-create";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { scc } from "@/core/command";
import { StudioExtensionMenuItem } from "@/core/extension-manager";
import { useConfig } from "@/context/config-provider";

export default function SchemaView() {
  const [search, setSearch] = useState("");
  const { databaseDriver } = useDatabaseDriver();
  const { currentSchemaName } = useSchema();
  const [isCreateSchema, setIsCreateSchema] = useState(false);
  const { extensions } = useConfig();

  const contentMenu = useMemo(() => {
    const items: StudioExtensionMenuItem[] = [];

    const flags = databaseDriver.getFlags();

    if (flags.supportCreateUpdateTable) {
      items.push({
        title: "Create Table",
        key: "create-table",
        onClick: () => {
          scc.tabs.openBuiltinSchema({ schemaName: currentSchemaName });
        },
      });
    }

    if (flags.supportCreateUpdateDatabase) {
      items.push({
        title: "Create Database/Schema",
        key: "create-schema",
        onClick: () => {
          setIsCreateSchema(true);
        },
      });
    }

    return [...items, ...extensions.getResourceCreateMenu()];
  }, [databaseDriver, currentSchemaName, extensions]);

  const activatorButton = useMemo(() => {
    if (contentMenu.length === 0) return null;

    if (contentMenu.length === 1) {
      return (
        <button
          className={cn(
            buttonVariants({
              size: "icon",
            }),
            "rounded-full h-8 w-8 bg-neutral-800 dark:bg-neutral-200"
          )}
          onClick={contentMenu[0].onClick}
        >
          <Plus size={16} weight="bold" />
        </button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              buttonVariants({
                size: "icon",
              }),
              "rounded-full h-8 w-8 bg-neutral-800 dark:bg-neutral-200"
            )}
          >
            <Plus size={16} weight="bold" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          {contentMenu.map((menu) => {
            return (
              <DropdownMenuItem key={menu.title} onClick={menu.onClick}>
                {menu.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [contentMenu]);
  return (
    <div className="flex flex-col overflow-hidden grow">
      {isCreateSchema && (
        <SchemaCreateDialog
          onClose={() => {
            setIsCreateSchema(false);
          }}
        />
      )}

      <div className="p-4 pb-2 flex flex-col">
        <div className="flex justify-between mb-5 items-center">
          <h1 className="text-xl font-medium text-primary">Tables</h1>
          {activatorButton}
        </div>

        <div className="overflow-hidden cursor-text items-center has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus]:outline-neutral-400/70 has-[:enabled]:active:outline-neutral-400/70 dark:has-[:focus]:outline-neutral-600 dark:has-[:enabled]:active:outline-neutral-600 flex w-full rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600 h-[32px]">
          <div className="text-sm h-full flex items-center">
            <LucideSearch
              className="text-neutral-500 "
              style={{ width: 14, height: 14 }}
            />
          </div>
          <input
            type="text"
            className="bg-transparent flex-1 p-2 pl-2 pr-2 outline-none text-sm font-light h-full grow placeholder:text-neutral-500"
            value={search}
            placeholder="Search tables"
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </div>
      </div>

      <SchemaList search={search} />
    </div>
  );
}

import { LucideSearch } from "lucide-react";
import { useCallback, useState } from "react";
import SchemaList from "./schema-sidebar-list";
import { openTab } from "@/messages/open-tab";
import { useSchema } from "@/context/schema-provider";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Plus } from "@phosphor-icons/react";

export default function SchemaView() {
  const [search, setSearch] = useState("");
  const { currentSchemaName } = useSchema();

  const onNewTable = useCallback(() => {
    openTab({
      type: "schema",
      schemaName: currentSchemaName,
    });
  }, [currentSchemaName]);

  return (
    <div className="flex flex-col overflow-hidden grow">
      <div className="pt-2 px-2 flex mb-2 flex flex-col">
        <div className="flex justify-between mb-2 items-center mx-2">
          <h1 className="text-xl py-2 font-semibold text-primary">Tables</h1>
          <button
            className={cn(
              buttonVariants({
                size: "icon",
              }),
              "rounded-full h-8 w-8"
            )}
            onClick={onNewTable}
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>

        <div className="border rounded overflow-hidden flex items-center grow mx-2">
          <div className="text-sm px-2 h-full flex items-center">
            <LucideSearch className="h-4 w-4 text-black dark:text-white" />
          </div>
          <input
            type="text"
            className="bg-inherit p-2 pl-2 pr-2 outline-none text-sm  h-full grow"
            value={search}
            placeholder="Search table"
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

import { LucidePlus, LucideSearch } from "lucide-react";
import { useCallback, useState } from "react";
import SchemaList from "./schema-sidebar-list";
import ListButtonItem from "./list-button-item";
import { Separator } from "../ui/separator";
import { openTab } from "@/messages/open-tab";
import { useConfig } from "@/context/config-provider";

export default function SchemaView() {
  const [search, setSearch] = useState("");
  const { sideBarFooterComponent } = useConfig();

  const onNewTable = useCallback(() => {
    openTab({
      type: "schema",
    });
  }, []);

  return (
    <div className="flex flex-col overflow-hidden grow">
      <div className="pt-2 px-2 flex h-10 -ml-3 mb-2">
        <div className="border rounded overflow-hidden flex items-center ml-3 grow">
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

      <div className="flex flex-col">
        <Separator />
        <div className="p-2 flex flex-col">
          <ListButtonItem
            text="Create New Table"
            icon={LucidePlus}
            onClick={onNewTable}
          />
        </div>

        <Separator />
        {sideBarFooterComponent}
      </div>
    </div>
  );
}

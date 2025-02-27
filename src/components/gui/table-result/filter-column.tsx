// import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ListChecks, LucideSettings2 } from "lucide-react";
import { useEffect, useState } from "react";
import OptimizeTableState from "../table-optimized/OptimizeTableState";

import { Button } from "@/components/orbit/button";


export default function useTableResultColumnFilter({
  state,
}: {
  state?: OptimizeTableState;
}) {
  const headers = state?.getHeaders() ?? [];
  const [columnIndexList, setColumnIndexList] = useState<number[]>([]);

  const columnFilterBadge = headers.length - columnIndexList.length;

  useEffect(() => {
    if (state) {
      const headers = state.getHeaders();
      return setColumnIndexList(headers.map((_, idx) => idx));
    }
  }, [state]);

  const filterColumnButton = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"secondary"} size={"sm"} className="ml-[3px] bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 flex items-center gap-1">
          <LucideSettings2 className="h-3 w-4" />
          Columns
          {!!columnFilterBadge && (
            <span className="h-4 w-4 ml-1 transform-y-[-2px] rounded-[1px] bg-neutral-700 border border-neutral-600 text-[11px] text-secondary text-secondary-foreground">
              {columnFilterBadge}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search column here" />
          {!!columnFilterBadge && (
            <>
              <button
                onClick={() => {
                  setColumnIndexList(headers.map((_, idx) => idx));
                }}
                className="relative mx-1 my-1 flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm font-semibold outline-hidden hover:bg-secondary aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Select all columns
              </button>
              <CommandSeparator />
            </>
          )}
          <CommandGroup className="max-h-[400px] overflow-y-auto">
            {headers.map((header, idx) => {
              const isChecked = columnIndexList.includes(idx);

              return (
                <CommandItem
                  value={header.display.text}
                  key={header.name}
                  onSelect={() => {
                    if (isChecked) {
                      setColumnIndexList(
                        columnIndexList.filter((cidx) => cidx !== idx)
                      );
                    } else {
                      const tmpSet = new Set(columnIndexList);
                      tmpSet.add(idx);
                      const tmpArray = Array.from(tmpSet);
                      tmpArray.sort((a, b) => a - b);
                      setColumnIndexList(tmpArray);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isChecked ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {header.display.text}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return { columnIndexList, filterColumnButton };
}

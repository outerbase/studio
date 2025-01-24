import { useEffect, useState } from "react";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { Button } from "@/components/ui/button";
import { Check, ListChecks, LucideSettings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
        <Button variant={"ghost"} size={"sm"}>
          <LucideSettings2 className="mr-2 h-4 w-4" />
          Columns
          {!!columnFilterBadge && (
            <span className="ml-2 h-4 w-4 rounded-full bg-primary text-[10px] text-primary text-primary-foreground">
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
                className="relative mx-1 my-1 flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm font-semibold outline-none hover:bg-secondary aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
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

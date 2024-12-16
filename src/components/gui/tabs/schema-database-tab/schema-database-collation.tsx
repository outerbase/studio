import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDatabaseDriver } from "@/context/driver-provider";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface SchemaCollateSelectProps {
  value?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

export function SchemaDatabaseCollation(
  {
    onChange,
    value,
  }: SchemaCollateSelectProps
) {
  const driver = useDatabaseDriver();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          className="w-[200px] justify-between"
        >
          {value || "Select collate"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search collation" />
          <CommandList>
            <CommandEmpty>No matched collation</CommandEmpty>
            <CommandGroup>
              {
                driver.databaseDriver.getCollationList().map(x => {
                  return (
                    <CommandItem key={x} value={x} onSelect={() => {
                      onChange(x);
                      setOpen(false)
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === x ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {x}
                    </CommandItem>
                  )
                })
              }
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
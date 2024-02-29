import { Check, ChevronsUpDown, LucideRefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { useSchema } from "@/context/SchemaProvider";
import { useState } from "react";
import { Separator } from "../ui/separator";

export default function TableCombobox({
  value,
  onChange,
  disabled,
}: Readonly<{
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const { schema, refresh } = useSchema();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button variant="outline" className="justify-between w-[200px]">
          {value ?? "No table selected"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search table name..." />

          <CommandEmpty>No table found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
            {schema.map((table) => (
              <CommandItem
                key={table.name}
                value={table.name}
                onSelect={() => {
                  onChange(table.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === table.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {table.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        <div className="p-1">
          <Separator />
          <Button
            variant="link"
            className="w-full"
            size={"sm"}
            onClick={() => {
              refresh();
            }}
          >
            <LucideRefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

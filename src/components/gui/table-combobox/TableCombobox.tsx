import { useSchema } from "@/context/schema-provider";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, LucideRefreshCw } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";

export default function TableCombobox({
  value,
  onChange,
  schemaName,
  disabled,
  borderless,
}: Readonly<{
  value?: string;
  schemaName: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  borderless?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const { schema, refresh } = useSchema();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {borderless ? (
          <div className="flex w-full items-center justify-between px-2">
            {value ?? "No table selected"}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </div>
        ) : (
          <div
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex w-full justify-between"
            )}
          >
            {value || "No table selected"}
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search table name..." />

          <CommandEmpty>No table found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
            {(schema[schemaName] ?? []).map((table) => (
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
            <LucideRefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

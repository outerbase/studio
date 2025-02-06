import { useDatabaseDriver } from "@/context/driver-provider";
import type { DatabaseTableSchema } from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../ui/command";
import { PopoverContent } from "../../ui/popover";

export default function TableColumnCombobox({
  value,
  tableName,
  schemaName,
  onChange,
  disabled,
}: Readonly<{
  schemaName: string;
  tableName: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}>) {
  const { databaseDriver } = useDatabaseDriver();
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState<DatabaseTableSchema>();

  useEffect(() => {
    if (tableName) {
      databaseDriver
        .tableSchema(schemaName, tableName)
        .then(setSchema)
        .catch(() => {
          setSchema({
            tableName,
            schemaName,
            columns: [],
            pk: [],
            autoIncrement: false,
            constraints: [],
          });
        });
    }
  }, [schemaName, tableName, databaseDriver]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button variant="outline" className="w-full justify-between">
          {value ?? "No column selected"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search column name..." />

          <CommandEmpty>No column found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
            {schema?.columns.map((column) => (
              <CommandItem
                key={column.name}
                value={column.name}
                onSelect={() => {
                  onChange(column.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === column.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {column.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

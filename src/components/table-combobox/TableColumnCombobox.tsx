import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "../ui/popover";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { DatabaseTableSchema } from "@/drivers/DatabaseDriver";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";

export default function TableColumnCombobox({
  value,
  tableName,
}: Readonly<{ tableName: string; value?: string }>) {
  const { databaseDriver } = useDatabaseDriver();
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState<DatabaseTableSchema>();

  useEffect(() => {
    if (tableName) {
      databaseDriver
        .getTableSchema(tableName)
        .then(setSchema)
        .catch(() => {
          setSchema({
            tableName,
            columns: [],
            pk: [],
            autoIncrement: false,
            constraints: [],
          });
        });
    }
  }, [schema, tableName, databaseDriver]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" className="justify-between w-[200px]">
          {value ?? "No column selected"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search column name..." />

          <CommandEmpty>No column found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
            {schema?.columns.map((column) => (
              <CommandItem key={column.name} value={column.name}>
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

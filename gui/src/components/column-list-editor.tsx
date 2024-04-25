import { LucidePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { useState } from "react";

interface Props {
  value: string[];
  columns: string[];
  onChange: (value: string[]) => void;
}

export default function ColumnListEditor({ value, columns, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      {value.map((columnName, idx) => {
        return (
          <div key={idx} className="p-1 px-2 bg-secondary rounded">
            {columnName}
          </div>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button className="p-1 bg-secondary rounded">
            <LucidePlus className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search column name..." />

            <CommandEmpty>No column found.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-y-auto">
              {columns.map((column) => (
                <CommandItem
                  key={column}
                  value={column}
                  onSelect={() => {
                    setOpen(false);
                    onChange([...value, column]);
                  }}
                >
                  {column}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSchema } from "@/context/schema-provider";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface SchemaNameSelectProps {
  value?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

export default function SchemaNameSelect({
  onChange,
  value,
  readonly,
}: SchemaNameSelectProps) {
  const { schema } = useSchema();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          className="w-[200px] justify-between"
          disabled={readonly}
        >
          {value || "Select schema"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search schema" />
          <CommandList>
            <CommandEmpty>No matched schema</CommandEmpty>
            <CommandGroup>
              {Object.keys(schema).map((s) => (
                <CommandItem
                  key={s}
                  value={s}
                  disabled={readonly}
                  onSelect={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === s ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

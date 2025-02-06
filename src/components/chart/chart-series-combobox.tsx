"use client";

import { Check, MoreVertical } from "lucide-react";
import * as React from "react";

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
import { cn } from "@/lib/utils";
interface SimpleComboValue {
  value: string;
  label: string;
}
interface ChartSeriesComboboxProps {
  values: SimpleComboValue[];
  onChange: (v: string) => void;
  placeholder?: string;
  selected?: string;
  onRemove: (v: string | null) => void;
}

export function ChartSeriesCombobox({
  values,
  onChange,
  placeholder,
  selected,
  onRemove,
}: ChartSeriesComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [openMore, setOpenMore] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<string | null>(
    selected || null
  );

  React.useEffect(() => {
    setSelectedValue(selected || null);
  }, [selected]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {values
              ? values.find((value) => value.value === selectedValue)?.label
              : placeholder || ""}
            <Popover open={openMore} onOpenChange={setOpenMore}>
              <PopoverTrigger asChild>
                <MoreVertical
                  className="w-4 cursor-pointer opacity-30"
                  style={{ zIndex: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        value="remove"
                        onSelect={() => {
                          onRemove(selectedValue || null);
                          setOpenMore(false);
                        }}
                      >
                        Remove
                      </CommandItem>
                      <CommandItem
                        value="remove_all"
                        onSelect={() => {
                          onRemove(null);
                          setOpenMore(false);
                        }}
                      >
                        Remove all
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {values.map((value, idx) => (
                  <CommandItem
                    key={idx}
                    value={value.value}
                    onSelect={(currentValue) => {
                      setSelectedValue(currentValue);
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    {value.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === value.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

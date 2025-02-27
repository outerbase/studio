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
import { ThemeColors } from "./chart-type";
import SimpleColorPicker from "./simple-color-picker";
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
  color?: string;
  onChangeColor: (color: string) => void;
  onThemeChange: (theme: ThemeColors) => void;
}

export function ChartSeriesCombobox({
  values,
  onChange,
  placeholder,
  selected,
  onRemove,
  color,
  onChangeColor,
  onThemeChange,
}: ChartSeriesComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [openMore, setOpenMore] = React.useState(false);
  const [openColorPicker, setOpenColorPicker] = React.useState(false);
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
            <div className="flex items-center">
              <Popover open={openColorPicker} onOpenChange={setOpenColorPicker}>
                <PopoverTrigger asChild>
                  <div
                    className="mr-2 h-[16px] w-[16px] cursor-pointer rounded-full"
                    style={{ backgroundColor: color || "gray" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenColorPicker(true);
                    }}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SimpleColorPicker
                    selected={color}
                    onThemeChange={onThemeChange}
                    onChange={function (color: string): void {
                      onChangeColor(color);
                    }}
                  ></SimpleColorPicker>
                </PopoverContent>
              </Popover>

              {values
                ? values.find((value) => value.value === selectedValue)?.label
                : placeholder || ""}
            </div>

            <Popover open={openMore} onOpenChange={setOpenMore}>
              <PopoverTrigger asChild>
                <MoreVertical
                  className="w-4 cursor-pointer opacity-30"
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

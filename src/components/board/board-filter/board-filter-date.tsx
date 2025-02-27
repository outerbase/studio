import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_DATE_FILTER } from "../board-filter-dialog";

interface Props {
  name: string;
  value: string;
  onChange: (v: string) => void;
}

export function BoardFilterDate(props: Props) {
  const [internalValue, setInternalValue] = useState(props.value);

  useEffect(() => {
    setInternalValue(props.value);
  }, [props.value]);

  return (
    <DropdownMenu
      onOpenChange={() => {
        props.onChange(internalValue);
      }}
    >
      <DropdownMenuTrigger asChild>
        <div
          className={
            internalValue ? "px-2 py-1" : "text-muted-foreground px-2 py-1"
          }
        >
          <div>{internalValue || `Select ${props.name}`}</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {DEFAULT_DATE_FILTER.map((date) => {
          return (
            <DropdownMenuItem
              key={date}
              onClick={() => {
                setInternalValue(date);
              }}
            >
              <div className="flex items-center gap-2">
                {date}
                {date === internalValue && <Check className="h-3 w-3" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

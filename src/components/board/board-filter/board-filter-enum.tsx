import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

interface Props {
  name: string;
  value: string;
  onChange: (v: string) => void;
  enums: string[];
}

export function BoardFilterEnum(props: Props) {
  const [internalValue, setInternalValue] = useState(props.value);

  useEffect(() => {
    setInternalValue(props.value);
  }, [props.value]);

  console.log(internalValue);

  return (
    <div className="z-100">
      <Popover
        onOpenChange={() => {
          props.onChange(internalValue);
        }}
      >
        <PopoverTrigger asChild>
          <div
            className={
              internalValue ? "px-2 py-1" : "text-muted-foreground px-2 py-1"
            }
          >
            <div>{internalValue || `Select ${props.name}`}</div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          {props.enums.map((v, idx) => {
            return (
              <div
                key={v + idx}
                className="mt-2 flex items-center justify-start gap-2"
              >
                <div className="w-4">
                  <Checkbox
                    id={v + idx}
                    checked={internalValue.split(",").includes(v)}
                    onCheckedChange={(checked) => {
                      const valueString = internalValue.split(",");
                      if (checked) {
                        const newValue = [...valueString, v]
                          .filter((f) => !!f)
                          .join(",");
                        setInternalValue(newValue);
                      } else {
                        const newValue = valueString
                          .filter((f) => f !== v)
                          .join(",");
                        setInternalValue(newValue);
                      }
                    }}
                  />
                </div>
                <label htmlFor={v + idx} className="text-left">
                  {v}
                </label>
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}

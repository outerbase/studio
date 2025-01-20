import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useMemo } from "react";

interface Props {
  placeholders: Record<string, string>;
  onChange: (placeHolders: Record<string, string>) => void;
}

export function QueryPlaceholder({
  placeholders,
  onChange,
}: Props): JSX.Element {
  const placeholderCount = Object.keys(placeholders).length;
  const emptyPlaceholderCount = Object.values(placeholders).filter(
    (v) => v === ""
  ).length;
  const hasEmptyPlaceholder = emptyPlaceholderCount > 0;

  const placeholderTable = useMemo(() => {
    return (
      <div className="overflow-auto max-h-[400px] relative border rounded">
        <table className="border-separate border-spacing-0 w-full text-sm">
          <thead className="top-0 sticky">
            <tr className="bg-secondary h-[35px] text-xs">
              <th className="border-r text-left px-2">Variables</th>
              <th className="text-left px-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(placeholders).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 border-t border-r">{key}</td>
                <td className="px-4 py-2 border-t">
                  <input
                    type="text"
                    className="font-mono bg-inherit w-full h-full outline-none border-0"
                    placeholder="Please fill your value"
                    value={value ?? ""}
                    onChange={(e) => {
                      const newValue = e.currentTarget.value;
                      const newPlaceHolders = {
                        ...placeholders,
                        [key]: newValue,
                      };
                      onChange(newPlaceHolders);
                    }}
                  ></input>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [placeholders, onChange]);

  return (
    <Popover>
      <PopoverTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {hasEmptyPlaceholder && (
            <div className="flex items-center justify-center h-full pr-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
          )}
          Placeholders
          <span className="ml-1 text-xs">
            {placeholderCount - emptyPlaceholderCount} / {placeholderCount}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        {placeholderTable}

        <p className="text-sm mt-2">
          Use <span className="font-mono bg-muted">&apos;&apos;</span> for an
          empty string. If the value is a number, it will automatically be cast
          to a number. To specify a numeric string, wrap it in single quote.
        </p>
      </PopoverContent>
    </Popover>
  );
}

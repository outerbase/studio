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
      <div className="relative max-h-[400px] overflow-auto rounded border">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0">
            <tr className="h-[35px] bg-secondary text-xs">
              <th className="border-r px-2 text-left">Variables</th>
              <th className="px-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(placeholders).map(([key, value]) => (
              <tr key={key}>
                <td className="border-r border-t px-4 py-2">{key}</td>
                <td className="border-t px-4 py-2">
                  <input
                    type="text"
                    className="h-full w-full border-0 bg-inherit font-mono outline-hidden"
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
            <div className="flex h-full items-center justify-center pr-2">
              <div className="h-2 w-2 animate-ping rounded-full bg-red-500"></div>
            </div>
          )}
          Variables
          <span className="ml-1 text-xs">
            {placeholderCount - emptyPlaceholderCount} / {placeholderCount}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        {placeholderTable}

        <p className="mt-2 text-sm">
          Use <span className="bg-muted font-mono">&apos;&apos;</span> for an
          empty string. If the value is a number, it will automatically be cast
          to a number. To specify a numeric string, wrap it in single quote.
        </p>
      </PopoverContent>
    </Popover>
  );
}

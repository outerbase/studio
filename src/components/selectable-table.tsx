import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";

interface SelectableTableProps<T> {
  items: T[];
  extractKey: (item: T) => string;
  renderRow: (item: T) => JSX.Element;
  headers: { key: string; text: string; width?: number | string }[];
  selectedItems: T[];
  onSelectedItemChanged: (selectedItems: T[]) => void;
  disabledSelection?: boolean;
  forceShowSelectedItem?: boolean;
}

export function SelectableTable<T>({
  items,
  headers,
  extractKey,
  renderRow,
  selectedItems,
  onSelectedItemChanged,
  disabledSelection,
  forceShowSelectedItem,
}: SelectableTableProps<T>) {
  const allSelected = items.length === selectedItems.length;
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const toggleAllChecked = useCallback(() => {
    if (allSelected) {
      onSelectedItemChanged([]);
    } else {
      onSelectedItemChanged([...items]);
    }
  }, [allSelected, items, onSelectedItemChanged]);

  // If we have no selected items, we should not show the
  // "Show only selected items" option
  useEffect(() => {
    if (selectedItems.length === 0) setShowOnlySelected(false);
  }, [selectedItems.length]);

  const visibilityOptionDom = useMemo(() => {
    if (selectedItems.length === 0) return null;

    if (showOnlySelected) {
      return (
        <span
          className="cursor-pointer text-blue-600 underline"
          onClick={() => setShowOnlySelected(false)}
        >
          Show all items
        </span>
      );
    }

    return (
      <span
        className="cursor-pointer text-blue-600 underline"
        onClick={() => {
          setShowOnlySelected(true);
        }}
      >
        Show only the selected items
      </span>
    );
  }, [selectedItems, showOnlySelected]);

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead className="sticky top-0">
        <tr className="h-[35px] bg-secondary text-xs">
          {!disabledSelection && (
            <th className="border-b border-r px-2 text-left"></th>
          )}
          {headers.map((header) => {
            return (
              <th
                className="border-b border-r px-2 text-left"
                style={{ width: header.width }}
                key={header.key}
              >
                {header.text}
              </th>
            );
          })}
        </tr>

        {!disabledSelection && (
          <tr className="h-[40px] bg-background">
            <th className="w-[40px] items-center justify-center border-b border-r">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAllChecked}
                disabled={disabledSelection}
              />
            </th>
            <th
              className="border-b px-2 text-left font-normal"
              colSpan={headers.length}
            >
              <div className="flex">
                <div className="flex flex-1 items-center gap-4 text-xs font-semibold">
                  <span>
                    {selectedItems.length} out of {items.length} item
                    {items.length > 1 && "s"} selected
                  </span>
                  {visibilityOptionDom}
                </div>
              </div>
            </th>
          </tr>
        )}
      </thead>
      <tbody className="font-mono">
        {items.map((item) => {
          const itemKey = extractKey(item);
          const isSelected = !!selectedItems.find(
            (t) => extractKey(t) === itemKey
          );

          // If we selected to show only selected items,
          // and this item is not selected, skip
          if (forceShowSelectedItem && !isSelected) return null;
          if (showOnlySelected && !isSelected) return null;

          return (
            <tr
              key={itemKey}
              onClick={
                !disabledSelection
                  ? () => {
                      if (isSelected) {
                        onSelectedItemChanged(
                          selectedItems.filter(
                            (item) => extractKey(item) !== itemKey
                          )
                        );
                      } else {
                        onSelectedItemChanged([...selectedItems, item]);
                      }
                    }
                  : undefined
              }
              className={cn(
                "h-[40px] cursor-pointer hover:bg-accent",
                isSelected ? "text-primary" : "text-gray-400 dark:text-gray-600"
              )}
            >
              {!disabledSelection && (
                <td className="flex h-[40px] items-center justify-center border-b border-r">
                  <Checkbox checked={isSelected} />
                </td>
              )}
              {renderRow(item)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function SelectableTableCell({ children }: PropsWithChildren) {
  return <td className="h-[40px] border-b px-2 py-2">{children}</td>;
}

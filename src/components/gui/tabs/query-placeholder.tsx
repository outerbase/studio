import { buttonVariants } from "@/components/ui/button";
import { LucideChevronDown } from "lucide-react";
interface Props {
  placeHolders: Record<string, string>;
  onChange: (placeHolders: Record<string, string>) => void;
}
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function QueryPlaceholder({
  placeHolders,
  onChange,
}: Props): JSX.Element {
  const placeHolderTable = () => {
    return (
      <div className="overflow-auto p-2">
        <table className="border-separate border-spacing-0 w-full text-sm">
          <thead className="top-0 sticky">
            <tr className="bg-secondary h-[35px] text-xs">
              <th className="border-r text-left px-2 border-b">Variable</th>
              <th className="border-r text-left px-2 border-b">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(placeHolders).map(([key, value]) => (
              <tr key={key}>
                <td className="border-r px-4 py-2 border-b">{key}</td>
                <td className="border-r px-4 py-2 border-b">
                  <input
                    type="text"
                    className="font-mono bg-inherit w-full h-full outline-none border-0"
                    value={value ?? ""}
                    onChange={(e) => {
                      const newValue = e.currentTarget.value;
                      const newPlaceHolders = {
                        ...placeHolders,
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
  };
  return (
    <Sheet>
      <SheetTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {hasPlaceHolderWithEmptyValue(placeHolders) && (
            <div className="flex items-center justify-center h-full pr-2">
              <div className="w-2 h-2 bg-orange-900 rounded-full"></div>
            </div>
          )}
          Placeholders{" "}
          {!!placeHolders && <LucideChevronDown className="w-4 h-4 ml-2" />}
        </div>
      </SheetTrigger>
      <SheetContent className="p-0">{placeHolderTable()}</SheetContent>
    </Sheet>
  );
}

export function hasPlaceHolderWithEmptyValue(
  placeHolders: Record<string, string>
) {
  return Object.values(placeHolders).some((value) => value === "");
}

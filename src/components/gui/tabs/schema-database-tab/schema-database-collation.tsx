import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDatabaseDriver } from "@/context/driver-provider";
import { ChevronsUpDown } from "lucide-react";

interface SchemaCollateSelectProps {
  value?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

export function SchemaDatabaseCollation(
  {
    onChange,
    value,
  }: SchemaCollateSelectProps
) {
  const driver = useDatabaseDriver();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          className="w-[200px] justify-between"
        >
          {value || "Select collate"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0 overflow-y-auto h-[500px]">
        {
          driver.databaseDriver.getCollationList().map(x => {
            return (
              <DropdownMenuItem key={x} onClick={() => {
                onChange(x);
              }}>{x}</DropdownMenuItem>
            )
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
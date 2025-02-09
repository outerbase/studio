import { CaretDown } from "@phosphor-icons/react";
import { getDatabaseIcon } from "../resource-card/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useBoardContext } from "./board-provider";

export default function BoardSourcePicker() {
  const { sources: sourceDriver } = useBoardContext();
  const sourceList = sourceDriver?.sourceList() ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          Pick <CaretDown className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="m-0 p-0" align="start" side="top">
        <Command>
          <CommandInput placeholder="Search data source" />

          <CommandList>
            <CommandEmpty>No data source found</CommandEmpty>
            <CommandGroup>
              {sourceList.map((source) => {
                const DatabaseIcon = getDatabaseIcon(source.type);

                return (
                  <CommandItem key={source.id} value={source.id}>
                    <DatabaseIcon />
                    {source.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

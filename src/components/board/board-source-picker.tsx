import { DatabaseSchemas } from "@/drivers/base-driver";
import { OuterbaseAPIError } from "@/outerbase-cloud/api-type";
import { CaretDown, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Loader } from "../orbit/loader";
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

interface BoardSourcePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onSchemaLoad?: (props: {
    schema: DatabaseSchemas;
    selectedSchema?: string;
  }) => void;
}

export default function BoardSourcePicker({
  value,
  onChange,
  onSchemaLoad,
}: BoardSourcePickerProps) {
  const [open, setOpen] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<OuterbaseAPIError>();
  const { sources: sourceDriver } = useBoardContext();
  const sourceList = sourceDriver?.sourceList() ?? [];
  const [search, setSearch] = useState("");

  const selectedSource = sourceList.find((source) => source.id === value);
  const DatabaseIcon = getDatabaseIcon(selectedSource?.type ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          {schemaError && (
            <span title={schemaError.message}>
              <WarningCircle className="mr-2 h-4 w-4 text-red-500" />
            </span>
          )}
          {loadingSchema ? (
            <Loader size={16} className="mr-2" />
          ) : (
            <DatabaseIcon className="mr-2 h-4 w-4" />
          )}
          {selectedSource?.name ?? "Please select source"}{" "}
          <CaretDown className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="m-0 p-0" align="start" side="top">
        <Command>
          <CommandInput
            placeholder="Search data source"
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>No data source found</CommandEmpty>
            <CommandGroup>
              {sourceList.map((source) => {
                const DatabaseIcon = getDatabaseIcon(source.type);

                return (
                  <CommandItem
                    key={source.id}
                    value={source.name}
                    onSelect={() => {
                      if (onChange && sourceDriver) {
                        onChange(source.id);

                        setLoadingSchema(true);
                        setSchemaError(undefined);

                        sourceDriver
                          .schemas(source.id)
                          .then((loadedSchema) => {
                            if (onSchemaLoad) {
                              onSchemaLoad(loadedSchema);
                            }
                          })
                          .catch((e) => {
                            if (e instanceof OuterbaseAPIError) {
                              setSchemaError(e);
                            } else {
                              setSchemaError(new OuterbaseAPIError(e.message));
                            }
                          })
                          .finally(() => {
                            setLoadingSchema(false);
                          });
                      }
                      setOpen(false);
                    }}
                  >
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

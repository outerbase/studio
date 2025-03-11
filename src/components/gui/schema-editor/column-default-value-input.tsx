import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudioContext } from "@/context/driver-provider";
import { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { ChevronsUpDown } from "lucide-react";
import { ChangeEvent, useCallback, useMemo } from "react";
import { Input } from "../../ui/input";

export default function ColumnDefaultValueInput({
  constraint,
  disabled,
  onChange,
}: Readonly<{
  constraint?: DatabaseTableColumnConstraint;
  disabled?: boolean;
  onChange: (constraint: DatabaseTableColumnConstraint) => void;
}>) {
  const { databaseDriver } = useStudioContext();
  const display = useMemo(() => {
    if (
      constraint?.defaultValue !== undefined &&
      constraint?.defaultValue !== null
    ) {
      return constraint.defaultValue.toString();
    } else if (constraint?.defaultExpression !== undefined) {
      return constraint?.defaultExpression;
    } else if (constraint?.autoIncrement) {
      return <span>Auto Increment</span>;
    }

    return <span className="text-gray-500">No Default</span>;
  }, [constraint]);

  const onAutoIncrementChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({
          defaultExpression: undefined,
          defaultValue: undefined,
          autoIncrement: checked,
        });
      }
    },
    [onChange]
  );

  const onDefaultValueChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({
          defaultExpression: undefined,
          defaultValue: undefined,
          autoIncrement: undefined,
        });
      }
    },
    [onChange]
  );

  const onCustomValueCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({
          autoIncrement: undefined,
          defaultExpression: undefined,
          defaultValue: "",
        });
      }
    },
    [onChange]
  );

  const onCustomValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange({
        autoIncrement: undefined,
        defaultExpression: undefined,
        defaultValue: e.currentTarget.value,
      });
    },
    [onChange]
  );

  const onExpressionCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({
          autoIncrement: undefined,
          defaultExpression: "",
          defaultValue: undefined,
        });
      }
    },
    [onChange]
  );

  const onExpressionValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange({
        autoIncrement: undefined,
        defaultExpression: e.currentTarget.value,
        defaultValue: undefined,
      });
    },
    [onChange]
  );

  const noDefaultValue =
    constraint?.defaultValue === undefined &&
    constraint?.defaultExpression === undefined &&
    !constraint?.autoIncrement;

  return (
    <Popover>
      <PopoverTrigger className="flex h-full w-full">
        <div className="bg-background flex h-full px-2 py-2 text-left text-sm">
          <div className="mr-2 w-[150px] grow overflow-hidden">
            {display || "EMPTY STRING"}
          </div>
          <div className="flex items-center text-gray-400">
            <ChevronsUpDown size={14} />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-default-value"
              disabled={disabled}
              checked={noDefaultValue}
              onCheckedChange={onDefaultValueChange}
            />
            <Label htmlFor="no-default-value">No Default Value</Label>
          </div>
          {databaseDriver.getFlags().dialect !== "postgres" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-increment"
                disabled={disabled}
                checked={!!constraint?.autoIncrement}
                onCheckedChange={onAutoIncrementChange}
              />
              <Label htmlFor="auto-increment">Autoincrement</Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-value"
              disabled={disabled}
              checked={constraint?.defaultValue !== undefined}
              onCheckedChange={onCustomValueCheckedChange}
            />
            <Label htmlFor="custom-value">Custom Value</Label>
          </div>
          <div className="mt-2 mb-2 flex">
            <Input
              readOnly={disabled}
              placeholder="Default Value"
              value={constraint?.defaultValue?.toString() ?? ""}
              onChange={onCustomValueChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-expression"
              disabled={disabled}
              checked={constraint?.defaultExpression !== undefined}
              onCheckedChange={onExpressionCheckedChange}
            />
            <Label htmlFor="custom-expression">Custom Expression</Label>
          </div>
          <div className="mt-2 mb-2 flex">
            <Input
              readOnly={disabled}
              placeholder="Expression"
              value={constraint?.defaultExpression?.toString() ?? ""}
              onChange={onExpressionValueChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

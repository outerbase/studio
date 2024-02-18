import { DatabaseTableColumnConstraint } from "@/drivers/DatabaseDriver";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { ChangeEvent, useCallback, useMemo } from "react";
import { Input } from "../ui/input";

export default function ColumnDefaultValueInput({
  constraint,
  disabled,
  onChange,
}: {
  constraint?: DatabaseTableColumnConstraint;
  disabled?: boolean;
  onChange: (constraint: DatabaseTableColumnConstraint) => void;
}) {
  const display = useMemo(() => {
    if (
      constraint?.defaultValue !== undefined &&
      constraint?.defaultValue !== null
    ) {
      return constraint.defaultValue.toString();
    } else if (constraint?.defaultExpression !== undefined) {
      return constraint?.defaultExpression;
    } else if (constraint?.autoIncrement) {
      return <span className="font-bold">Auto Increment</span>;
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
      <PopoverTrigger>
        <div className="flex text-left shadow-sm py-2 px-3 rounded-md border w-[180px] h-full bg-white">
          <div className="flex-grow">{display || "EMPTY STRING"}</div>
          <div className="text-gray-400 flex items-center">
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-increment"
              disabled={disabled}
              checked={!!constraint?.autoIncrement}
              onCheckedChange={onAutoIncrementChange}
            />
            <Label htmlFor="auto-increment">Autoincrement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-value"
              disabled={disabled}
              checked={constraint?.defaultValue !== undefined}
              onCheckedChange={onCustomValueCheckedChange}
            />
            <Label htmlFor="custom-value">Custom Value</Label>
          </div>
          <div className="flex mt-2 mb-2">
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
          <div className="flex mt-2 mb-2">
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

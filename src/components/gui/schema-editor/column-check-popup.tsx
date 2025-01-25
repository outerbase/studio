import { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { LucideCheck } from "lucide-react";
import { Button } from "../../ui/button";
import { ColumnChangeEvent } from "./schema-editor-column-list";
import { Textarea } from "../../ui/textarea";

export default function ColumnCheckPopup({
  constraint,
  disabled,
  onChange,
}: Readonly<{
  constraint: DatabaseTableColumnConstraint;
  disabled: boolean;
  onChange: ColumnChangeEvent;
}>) {
  return (
    <Popover>
      <PopoverTrigger>
        <span className="p-1 shadow-sm border rounded block">
          <LucideCheck className="w-4 h-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm">Check</div>

          <Textarea
            rows={4}
            placeholder="Check Expression"
            className="font-mono bg-background"
            disabled={disabled}
            value={constraint.checkExpression ?? ""}
            onChange={(e) => {
              onChange({
                constraint: {
                  checkExpression: e.currentTarget.value,
                },
              });
            }}
          />

          <Button
            size="sm"
            className="mt-4"
            variant={"destructive"}
            disabled={disabled}
            onClick={() => {
              onChange({
                constraint: {
                  checkExpression: undefined,
                },
              });
            }}
          >
            Remove Constraint
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

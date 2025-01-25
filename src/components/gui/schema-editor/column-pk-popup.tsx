import { DatabaseTableColumnConstraint, SqlOrder } from "@/drivers/base-driver";
import { LucideKeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import ConflictClauseOptions from "./column-conflict-clause";
import { ColumnChangeEvent } from "./schema-editor-column-list";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function ColumnPrimaryKeyPopup({
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
        <span className="p-1 shadow-sm border rounded block bg-green-200 dark:bg-green-600">
          <LucideKeyRound className="w-4 h-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm">Primary Key</div>
          <Select
            value={constraint.primaryKeyOrder}
            disabled={disabled}
            onValueChange={(v) => {
              onChange({
                constraint: {
                  primaryKeyOrder: v as SqlOrder,
                },
              });
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">ASC</SelectItem>
              <SelectItem value="DESC">DESC</SelectItem>
            </SelectContent>
          </Select>
          <ConflictClauseOptions
            value={constraint.primaryKeyConflict}
            disabled={disabled}
            onChange={(v) => {
              onChange({
                constraint: {
                  primaryKeyConflict: v,
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
                  primaryKey: undefined,
                  primaryKeyConflict: undefined,
                  primaryKeyOrder: undefined,
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

import { DatabaseTableColumnConstraint } from "@/drivers/base-driver";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { LucideSigma } from "lucide-react";
import { Button } from "../../ui/button";
import { ColumnChangeEvent } from "./schema-editor-column-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

export default function ColumnGeneratingPopup({
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
          <LucideSigma className="w-4 h-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm">Generating Function</div>

          <Textarea
            rows={4}
            disabled={disabled}
            placeholder="Generate Expression"
            className="font-mono bg-background"
            onChange={(e) => {
              onChange({
                constraint: {
                  generatedExpression: e.currentTarget.value,
                },
              });
            }}
            value={constraint.generatedExpression ?? ""}
          />

          <Select
            value={constraint?.generatedType}
            onValueChange={(type) => {
              onChange({
                constraint: {
                  generatedType: type as "STORED" | "VIRTUAL",
                },
              });
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select datatype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIRTUAL">Virtual</SelectItem>
              <SelectItem value="STORED">Stored</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            className="mt-4"
            variant={"destructive"}
            disabled={disabled}
            onClick={() => {
              onChange({
                constraint: {
                  generatedExpression: undefined,
                  generatedType: undefined,
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

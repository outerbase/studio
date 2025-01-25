import { DatabaseForeignKeyClause } from "@/drivers/base-driver";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { LucideArrowUpRight } from "lucide-react";
import { Button } from "../../ui/button";
import { ColumnChangeEvent } from "./schema-editor-column-list";
import TableColumnCombobox from "../table-combobox/TableColumnCombobox";
import TableCombobox from "../table-combobox/TableCombobox";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";

export default function ColumnForeignKeyPopup({
  constraint,
  disabled,
  schemaName,
  onChange,
}: Readonly<{
  constraint: DatabaseForeignKeyClause;
  schemaName: string;
  disabled: boolean;
  onChange: ColumnChangeEvent;
}>) {
  return (
    <Popover>
      <PopoverTrigger>
        <span className="p-1 shadow-sm border rounded block bg-blue-300 dark:bg-blue-600">
          <LucideArrowUpRight className="w-4 h-4" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm">Foreign Key</div>

          <Separator />

          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-xs font-normal">Foreign Table Name</Label>
            <TableCombobox
              schemaName={schemaName}
              value={constraint.foreignTableName}
              disabled={disabled}
              onChange={(newTable) => {
                onChange({
                  constraint: {
                    foreignKey: {
                      ...constraint,
                      foreignTableName: newTable,
                    },
                  },
                });
              }}
            />
          </div>

          {constraint.foreignTableName && (
            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-xs font-normal">Foreign Column Name</Label>
              <TableColumnCombobox
                value={(constraint.foreignColumns ?? [undefined])[0]}
                disabled={disabled}
                onChange={(colName) => {
                  onChange({
                    constraint: {
                      foreignKey: {
                        ...constraint,
                        foreignColumns: [colName],
                      },
                    },
                  });
                }}
                schemaName={schemaName}
                tableName={constraint.foreignTableName}
              />
            </div>
          )}

          <Button
            size="sm"
            className="mt-4"
            variant={"destructive"}
            disabled={disabled}
            onClick={() => {
              onChange({
                constraint: {
                  foreignKey: undefined,
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

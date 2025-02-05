import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HighlightText from "@/components/ui/highlight-text";
import {
  DatabaseTableColumn,
  DatabaseTableSchema,
} from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import {
  Edit3,
  EyeOff,
  LucideMoreHorizontal,
  ToggleLeftIcon,
  ToggleRightIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import DataCatalogTableColumnModal from "./data-catalog-table-column-modal";
import DataCatalogDriver from "./driver";

interface DataCatalogTableColumnProps {
  table: DatabaseTableSchema;
  column: DatabaseTableColumn;
  driver: DataCatalogDriver;
  search?: string;
  hasDefinitionOnly?: boolean;
}

export default function DataCatalogTableColumn({
  column,
  table,
  driver,
  search,
  hasDefinitionOnly,
}: DataCatalogTableColumnProps) {
  const modelColumn = driver.getColumn(
    table.schemaName,
    table.tableName!,
    column.name
  );

  const definition = modelColumn?.definition;
  const sampleData = modelColumn?.samples ?? [];
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hideFromEzql, setHideFromEzql] = useState<boolean>(() => {
    return modelColumn?.hideFromEzql || true;
  });

  const onToggleHideFromEzql = useCallback(() => {
    setHideFromEzql(!hideFromEzql);
    setLoading(true);
    driver
      .updateColumn(table.schemaName, table.tableName!, column.name, {
        ...modelColumn!,
        hideFromEzql: !hideFromEzql,
      })
      .finally(() => {
        setLoading(false);
      });
  }, [driver, table, hideFromEzql, modelColumn, column]);

  if (hasDefinitionOnly && !definition) {
    return null;
  }

  return (
    <div
      key={column.name}
      className={cn(
        "border-accent flex border-t pt-2 pb-2 text-sm",
        hideFromEzql ? "opacity-100" : "opacity-50"
      )}
    >
      <Button
        disabled={loading}
        onClick={onToggleHideFromEzql}
        size={"icon"}
        variant="ghost"
      >
        {hideFromEzql ? (
          <ToggleRightIcon className="text-black dark:text-green-500" />
        ) : (
          <ToggleLeftIcon className="text-gray-400" />
        )}
      </Button>

      <div className="flex w-[150px] items-center p-2">
        <HighlightText text={column.name} highlight={search} />
      </div>
      <div className="text-muted-foreground flex-1 p-2">
        {definition || "No description"}
      </div>
      <div className="w-[150px] p-2">
        {sampleData.length > 0 && (
          <span className="bg-secondary rounded p-1 px-2 text-xs">
            {sampleData.length} sample data
          </span>
        )}
      </div>
      {
        //=================
        // Dropdown menu
        //=================
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!hideFromEzql}>
          <Button size="icon" variant="ghost">
            <LucideMoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-2">
          <DropdownMenuItem
            className="gap-5"
            onClick={() => {
              setOpen(true);
            }}
          >
            Edit Column
            <div className="flex-1" />
            <Edit3 className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-5" onClick={onToggleHideFromEzql}>
            Hide from EZQL
            <div className="flex-1" />
            <EyeOff className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {
        //=================
        // Column metadata modal
        //=================
      }
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {open && (
            <DataCatalogTableColumnModal
              driver={driver}
              schemaName={table.schemaName}
              tableName={table.tableName!}
              columnName={column.name}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

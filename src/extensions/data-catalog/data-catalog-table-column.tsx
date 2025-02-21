import { Button } from "@/components/orbit/button";
import { Toggle } from "@/components/orbit/toggle";
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
import { Edit3, EyeOff, LucideMoreHorizontal } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import DataCatalogTableColumnModal from "./data-catalog-table-column-modal";
import { useDataCatalogContext } from "./data-model-tab";

interface DataCatalogTableColumnProps {
  table: DatabaseTableSchema;
  column: DatabaseTableColumn;
  hasDefinitionOnly?: boolean;
}

export default function DataCatalogTableColumn({
  column,
  table,
  hasDefinitionOnly,
}: DataCatalogTableColumnProps) {
  const { driver, search } = useDataCatalogContext();

  const modelColumn = driver.getColumn(
    table.schemaName,
    table.tableName!,
    column.name
  );
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(() => {
    return modelColumn?.hide ?? true;
  });

  const handleClickToggle = useCallback(() => {
    driver
      .updateColumn(table.schemaName, table.tableName!, column.name, {
        samples: modelColumn?.samples ?? [],
        definition: modelColumn?.definition ?? "",
        hide: !enabled,
      })
      .then(() =>
        toast.success(`${column.name} is turned ${!enabled ? "on" : "off"}`)
      )
      .catch(() => toast.error("Failed to update column"));
    setEnabled((prev) => !prev);
  }, [modelColumn, driver, enabled, table, column]);

  if (hasDefinitionOnly) {
    return null;
  }

  return (
    <div
      key={column.name}
      className={cn(
        "border-accent flex items-center border-t pt-2 pb-2 text-sm",
        enabled ? "opacity-100" : "opacity-50"
      )}
    >
      <Toggle size="sm" toggled={enabled} onChange={handleClickToggle} />
      <div className="flex w-[150px] items-center p-2 text-base">
        <HighlightText text={column.name} highlight={search} />
      </div>
      <div className="text-muted-foreground flex-1 p-2 text-base">
        {modelColumn?.definition || "No description"}
      </div>
      <div className="w-[150px] p-2">
        {modelColumn && modelColumn?.samples.length > 0 && (
          <span className="bg-secondary rounded p-1 px-2 text-sm">
            {modelColumn?.samples.length} sample data
          </span>
        )}
      </div>
      {
        //=================
        // Dropdown menu
        //=================
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!enabled}>
          <Button variant="ghost">
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
          <DropdownMenuItem className="gap-5" onClick={handleClickToggle}>
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

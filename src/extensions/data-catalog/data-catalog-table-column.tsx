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
import { OuterbaseDataCatalogComment } from "@/outerbase-cloud/api-type";
import { Edit3, EyeOff, LucideMoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DataCatalogTableColumnModal from "./data-catalog-table-column-modal";
import DataCatalogDriver from "./driver";

interface DataCatalogTableColumnProps {
  table: DatabaseTableSchema;
  column: DatabaseTableColumn;
  driver: DataCatalogDriver;
  search?: string;
  hasDefinitionOnly?: boolean;
  onToggleHideFromEzql: (
    column?: OuterbaseDataCatalogComment,
    cb?: () => void
  ) => void;
}

export default function DataCatalogTableColumn({
  column,
  table,
  driver,
  search,
  hasDefinitionOnly,
  onToggleHideFromEzql,
}: DataCatalogTableColumnProps) {
  const modelColumn = driver.getColumn(
    table.schemaName,
    table.tableName!,
    column.name
  );
  const definition = modelColumn?.body;

  const [open, setOpen] = useState(false);
  const [hideFromEzql, setHideFromEzql] = useState<boolean>(() => {
    if (modelColumn?.flags) {
      return modelColumn.flags.isActive;
    }
    return true;
  });

  const handleClickToggle = useCallback(() => {
    if (!modelColumn) return;
    setHideFromEzql(!hideFromEzql);
    onToggleHideFromEzql({
      ...modelColumn,
      flags: {
        ...modelColumn.flags,
        isActive: !hideFromEzql,
      },
    });
  }, [modelColumn, hideFromEzql, onToggleHideFromEzql]);

  const sampleData = useMemo(() => {
    if (modelColumn?.sample_data) {
      return modelColumn.sample_data.split(",").map((s) => s.trim());
    }
    return [];
  }, [modelColumn]);

  if (hasDefinitionOnly && !definition) {
    return null;
  }

  return (
    <div
      key={column.name}
      className={cn(
        "border-accent flex items-center border-t pt-2 pb-2 text-sm",
        hideFromEzql ? "opacity-100" : "opacity-50"
      )}
    >
      <Toggle size="sm" toggled={hideFromEzql} onChange={handleClickToggle} />
      <div className="flex w-[150px] items-center p-2 text-base">
        <HighlightText text={column.name} highlight={search} />
      </div>
      <div className="text-muted-foreground flex-1 p-2 text-base">
        {definition || "No description"}
      </div>
      <div className="w-[150px] p-2">
        {sampleData.length > 0 && (
          <span className="bg-secondary rounded p-1 px-2 text-sm">
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

import { Button } from "@/components/orbit/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatabaseTableSchema } from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import { Blend, ChevronDown, Edit3, LucideMoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import DataCatalogTableColumn from "./data-catalog-table-column";
import { useDataCatalogContext } from "./data-model-tab";
import DataCatalogDriver from "./driver";
import TableMetadataModal from "./table-metadata-modal";
import VirtualJoinColumn from "./virtual-column";
import { virtualJoinDialog } from "./virtual-join-modal";

interface DataCatalogTableAccordionProps {
  table: DatabaseTableSchema;
  driver: DataCatalogDriver;
  columnName?: string;
  hasDefinitionOnly?: boolean;
}

export default function DataCatalogTableAccordion({
  table,
  driver,
  hasDefinitionOnly,
}: DataCatalogTableAccordionProps) {
  const modelTable = driver.getTable(table.schemaName, table.tableName!);
  const virtualJoinList = modelTable?.relations ?? [];

  const [collapsible, setCollapsible] = useState(false);
  const { search } = useDataCatalogContext();
  const [open, setOpen] = useState(false);

  const tableMetadata = modelTable?.metadata;

  // Check if any of the column match?
  const matchColumns = useMemo(() => {
    if (!search || search.toLowerCase() === table.tableName!.toLowerCase()) {
      return table.columns;
    }
    return table.columns.filter((column) =>
      column.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, table]);

  const matchedTableName = useMemo(() => {
    if (search) {
      return table.tableName!.toLowerCase().includes(search?.toLowerCase());
    }
    return true;
  }, [search, table]);

  // this will work only toggle check box
  if (hasDefinitionOnly) {
    const columnsDefinition = table.columns
      .map((col) => {
        const modelColumn = driver.getColumn(
          table.schemaName,
          table.tableName!,
          col.name
        );
        return modelColumn?.definition;
      })
      .filter(Boolean);
    if (columnsDefinition.length === 0) {
      return null;
    }
  }

  if (!matchedTableName && matchColumns.length === 0 && search) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {open && (
            <TableMetadataModal
              schemaName={table.schemaName}
              tableName={table.tableName!}
              data={tableMetadata}
              onClose={() => {
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Collapsible open={collapsible} onOpenChange={setCollapsible}>
        <div className="rounded-xl border border-neutral-200 bg-white/50 p-3 hover:border-neutral-300 hover:bg-white dark:border-neutral-800/50 dark:bg-neutral-900 dark:text-white dark:hover:border-neutral-800 dark:hover:bg-neutral-800">
          <div className="flex p-2">
            <div>
              <div className="font-bold">
                {tableMetadata ? tableMetadata.alias : table.tableName}
              </div>

              {tableMetadata && (
                <div className="mt-2 mb-2">
                  {tableMetadata.alias !== table.tableName && (
                    <div className="text-sm font-medium text-neutral-500">
                      The table formerly known as{" "}
                      <span className="text-white italic">
                        {table.tableName}
                      </span>
                    </div>
                  )}
                  {tableMetadata?.definition && (
                    <div className="mt-2 text-base font-semibold">
                      {tableMetadata?.definition}
                    </div>
                  )}
                </div>
              )}
            </div>
            <CollapsibleTrigger className="flex-1" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="base" variant="ghost">
                    <LucideMoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-2">
                  <DropdownMenuItem
                    className="gap-1"
                    onClick={() => {
                      setOpen(true);
                    }}
                  >
                    Edit Metadata
                    <div className="flex-1" />
                    <Edit3 className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      virtualJoinDialog.show({
                        driver,
                        relation: {
                          schemaName: table.schemaName,
                          tableName: table.tableName || "",
                          referenceTableName: "",
                          referenceColumnName: "",
                          columnName: "",
                          hide: false,
                        },
                      });
                    }}
                    className="gap-1"
                  >
                    Add Virtaul Join
                    <div className="flex-1" />
                    <Blend className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CollapsibleTrigger>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transform transition-transform duration-200",
                    collapsible ? "rotate-180" : "rotate-0"
                  )}
                />
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            {matchColumns.map((column) => {
              return (
                <DataCatalogTableColumn
                  key={column.name}
                  column={column}
                  table={table}
                  hasDefinitionOnly={hasDefinitionOnly}
                />
              );
            })}
            {virtualJoinList.length > 0 && (
              <div className="rounded-xl border border-neutral-200 p-3 hover:bg-white dark:border-neutral-800/50 dark:bg-neutral-950 dark:text-white">
                <div className="p-3 font-bold">Relationships</div>
                {virtualJoinList.map((column) => {
                  return <VirtualJoinColumn data={column} key={column.id} />;
                })}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </>
  );
}

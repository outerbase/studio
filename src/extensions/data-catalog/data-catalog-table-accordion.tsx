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
import { OuterbaseDataCatalogComment } from "@/outerbase-cloud/api-type";
import { Blend, ChevronDown, Edit3, LucideMoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import DataCatalogTableColumn from "./data-catalog-table-column";
import DataCatalogDriver from "./driver";
import TableMetadataModal from "./table-metadata-modal";
import VirtualJoinColumn from "./virtual-column";
import VirtualJoinModal from "./virtual-join-modal";

interface DataCatalogTableAccordionProps {
  table: DatabaseTableSchema;
  driver: DataCatalogDriver;
  search?: string;
  columnName?: string;
  hasDefinitionOnly?: boolean;
}

export default function DataCatalogTableAccordion({
  table,
  driver,
  search,
  hasDefinitionOnly,
}: DataCatalogTableAccordionProps) {
  const modelTable = driver.getTable(table.schemaName, table.tableName!);
  const [collapsible, setCollapsible] = useState(false);
  const [seletedColumn, setSelectedColumn] = useState<
    OuterbaseDataCatalogComment | undefined
  >();
  const [open, setOpen] = useState(false);
  const [openVirtualModal, setOpenVirtaulModal] = useState(false);

  const onDeletRelationship = useCallback(
    (id: string) => {
      driver.deleteVirtualColumn(table.schemaName, table.tableName!, id);
    },
    [driver, table]
  );

  const onToggleHideFromEzql = useCallback(
    (
      modelColumn?: OuterbaseDataCatalogComment,
      cb?: () => void,
      isVirtual?: boolean
    ) => {
      if (!modelColumn) return;
      driver
        .updateColumn(
          table.schemaName,
          table.tableName!,
          {
            flags: modelColumn.flags,
            body: modelColumn.body,
            column: modelColumn.column,
            sample_data: modelColumn.sample_data,
            schema: modelColumn.schema,
            table: modelColumn.table,
            virtual_key_column: modelColumn.virtualKeyColumn,
            virtual_key_schema: modelColumn.virtualKeySchema,
            virtual_key_table: modelColumn.virtualKeyTable,
          },
          modelColumn.id,
          isVirtual
        )
        .then(() => {
          let msg = `${modelColumn.column} is turned ${modelColumn.flags.isActive ? "on" : "off"}`;
          if (isVirtual) {
            msg = "Virtual relationship status updated.";
          }
          toast.success(msg);
        })
        .catch((error) => toast.error(error.message))
        .finally(() => {
          cb && cb();
        });
    },
    [driver, table]
  );

  const tableMetadata = useMemo(() => {
    if (modelTable && modelTable.metadata) {
      return modelTable.metadata;
    }
  }, [modelTable]);

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

  const virtualJoins = useMemo(() => {
    if (modelTable?.virtualJoin && modelTable.virtualJoin.length > 0) {
      return modelTable.virtualJoin;
    }
    return [];
  }, [modelTable]);

  // this will work only toggle check box
  if (hasDefinitionOnly) {
    const columnsDefinition = table.columns
      .map((col) => {
        const modelColumn = driver.getColumn(
          table.schemaName,
          table.tableName!,
          col.name
        );
        return !!modelColumn?.body;
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
              driver={driver}
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

      <Dialog open={openVirtualModal} onOpenChange={setOpenVirtaulModal}>
        <DialogContent>
          {openVirtualModal && (
            <VirtualJoinModal
              driver={driver}
              data={seletedColumn}
              tableName={table.tableName!}
              schemaName={table.schemaName}
              onSuccess={() => setCollapsible(true)}
              onClose={() => {
                setOpenVirtaulModal(false);
                setSelectedColumn(undefined);
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
                  {tableMetadata?.body && (
                    <div className="mt-2 text-base font-semibold">
                      {tableMetadata?.body}
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
                    disabled={modelTable?.virtualJoin.length === 0}
                    onClick={() => {
                      setOpenVirtaulModal(true);
                      setSelectedColumn(undefined);
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
                  table={table}
                  column={column}
                  driver={driver}
                  search={search}
                  hasDefinitionOnly={hasDefinitionOnly}
                  onToggleHideFromEzql={onToggleHideFromEzql}
                />
              );
            })}
            {virtualJoins.length > 0 && (
              <div className="rounded-xl border border-neutral-200 p-3 hover:bg-white dark:border-neutral-800/50 dark:bg-neutral-950 dark:text-white">
                <div className="p-3 font-bold">Relationships</div>
                {virtualJoins.map((column) => {
                  return (
                    <VirtualJoinColumn
                      data={column}
                      key={column.id}
                      onEditRelationship={() => {
                        setOpenVirtaulModal(true);
                        setSelectedColumn(column);
                      }}
                      onToggleHideFromEzql={onToggleHideFromEzql}
                      onDeletRelatinship={() => {
                        onDeletRelationship(column.id);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </>
  );
}

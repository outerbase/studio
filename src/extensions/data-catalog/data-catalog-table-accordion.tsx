import { Button } from "@/components/ui/button";
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
import { ChevronDown, Edit3, EyeOff, LucideMoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DataCatalogTableColumn from "./data-catalog-table-column";
import DataCatalogDriver, { VirtualJoinColumn } from "./driver";
import VirtaulJoinColumn from "./virtual-column";
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
  const [open, setOpen] = useState(true);
  const [virtaulJoinColumn, setVirtualColumn] = useState<VirtualJoinColumn>();
  const [openVirtualModal, setOpenVirtaulModal] = useState(false);

  const [definition, setDefinition] = useState(modelTable?.definition || "");

  const onUpdateTable = useCallback(() => {
    if (
      definition &&
      definition.trim() &&
      definition !== modelTable?.definition
    ) {
      driver.updateTable(table?.schemaName, table.tableName!, {
        ...modelTable,
        definition,
      });
    }
  }, [driver, table, definition, modelTable]);

  const onDeletRelationship = useCallback(
    (id: string) => {
      const newVirtualJoinColumn = modelTable?.virtualJoin?.filter(
        (col) => col.id !== id
      );
      driver
        .updateTable(table?.schemaName, table.tableName!, {
          ...modelTable,
          virtualJoin: newVirtualJoinColumn,
        })
        .then(() => {
          console.log("deleted sucessful");
        });
    },
    [driver, modelTable]
  );

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
        return !!modelColumn?.definition;
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
      <Dialog open={openVirtualModal} onOpenChange={setOpenVirtaulModal}>
        <DialogContent>
          <VirtualJoinModal
            driver={driver}
            column={virtaulJoinColumn}
            tableName={table.tableName!}
            schemaName={table.schemaName}
            onClose={() => {
              setOpenVirtaulModal(false);
              setVirtualColumn(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border border-neutral-200 bg-white/50 p-3 hover:border-neutral-300 hover:bg-white dark:border-neutral-800/50 dark:bg-neutral-900 dark:text-white dark:hover:border-neutral-800 dark:hover:bg-neutral-800">
          <div className="flex p-2">
            <div>
              <div className="font-bold">{table.tableName}</div>
              <input
                value={definition}
                placeholder="No description"
                onBlur={onUpdateTable}
                onChange={(e) => {
                  e.preventDefault();
                  setDefinition(e.currentTarget.value);
                }}
                className="h-[30px] w-[150px] p-0 text-[13px] focus-visible:outline-none"
              />
            </div>
            <CollapsibleTrigger className="flex-1" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                    Edit Metadata
                    <div className="flex-1" />
                    <Edit3 className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setOpenVirtaulModal(true)}
                    className="gap-5"
                  >
                    Add Virtaul Join
                    <div className="flex-1" />
                    <EyeOff className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CollapsibleTrigger>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transform transition-transform duration-200",
                    open ? "rotate-180" : "rotate-0"
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
                />
              );
            })}
            {modelTable?.virtualJoin && modelTable.virtualJoin.length > 0 && (
              <div className="rounded-xl border border-neutral-200 p-3 hover:bg-white dark:border-neutral-800/50 dark:bg-neutral-950 dark:text-white">
                <div className="p-3 font-bold">Relationship</div>
                <div className="">
                  {modelTable.virtualJoin?.map((column) => {
                    return (
                      <VirtaulJoinColumn
                        key={column.id}
                        {...column}
                        onEditRelationship={() => {
                          setOpenVirtaulModal(true);
                          setVirtualColumn(column);
                        }}
                        onDeletRelatinship={() => {
                          onDeletRelationship(column.id);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </>
  );
}

import TableColumnCombobox from "@/components/gui/table-combobox/TableColumnCombobox";
import TableCombobox from "@/components/gui/table-combobox/TableCombobox";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LucideLoader } from "lucide-react";
import { useState } from "react";
import DataCatalogDriver, {
  DataCatalogModelTableInput,
  VirtualJoinColumn,
} from "./driver";

interface Props {
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  column?: VirtualJoinColumn;
  onClose: () => void;
}
export default function VirtualJoinModal({
  tableName,
  schemaName,
  driver,
  column,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [virtualKeySchema, setVirtualKeySchema] = useState<string | undefined>(
    column?.virtualKeySchema
  );

  const [virtualKeyTable, setVirtualKeyTable] = useState<string | undefined>(
    column?.virtualKeyTable
  );
  const [virtualKeyColumn, setVirtualKeyColumn] = useState<string | undefined>(
    column?.virtualKeyColumn
  );

  const createVirtualJoin = () => {
    setLoading(true);

    const modelTable = driver.getTable(schemaName, tableName);
    const virtualJoin = [...(modelTable?.virtualJoin || [])];

    const newVirtualJoin = {
      id: column?.id || new Date().toISOString(),
      schema: schemaName,
      tableName: tableName,
      columnName: virtualKeyColumn || "",
      virtualKeyColumn: virtualKeyColumn || "",
      virtualKeySchema: virtualKeySchema || "",
      virtualKeyTable: virtualKeyTable || "",
    };

    if (column?.id) {
      const index = virtualJoin.findIndex((col) => col.id === column.id);
      if (index > -1) {
        virtualJoin[index] = newVirtualJoin;
      }
    } else {
      virtualJoin.push(newVirtualJoin);
    }

    const updatedData: DataCatalogModelTableInput = {
      ...modelTable,
      virtualJoin,
    };

    driver
      ?.updateTable(schemaName, tableName, updatedData)
      .then((r) => console.log("Updated successfully:", r))
      .catch((error) => {
        console.error("Error updating virtual join:", error);
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Relationship to {tableName}</DialogTitle>
        <DialogDescription>
          Use virtual relationships to connect fields that don&apos;t have a
          direct foreign key link. For example, if two tables should be related
          by email or title but don&apos;t have a formal foreign key, use these
          virtual relationships to link them.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Column</Label>
        </div>
        <TableColumnCombobox
          value={virtualKeySchema}
          schemaName={schemaName}
          tableName={tableName}
          onChange={setVirtualKeySchema}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Relationship Table</Label>
          </div>
          <TableCombobox
            value={virtualKeyTable}
            schemaName={schemaName}
            onChange={setVirtualKeyTable}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Relationship Column</Label>
          </div>
          <TableColumnCombobox
            value={virtualKeyColumn}
            schemaName={schemaName}
            tableName={tableName}
            onChange={setVirtualKeyColumn}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          disabled={!virtualKeyColumn || !virtualKeySchema || !virtualKeyTable}
          onClick={createVirtualJoin}
        >
          {loading && <LucideLoader className="mr-1 h-4 w-4 animate-spin" />}
          {column ? "Edit Relationship" : "Create Virtual Join"}
        </Button>
        <div className="flex-1" />
      </DialogFooter>
    </>
  );
}

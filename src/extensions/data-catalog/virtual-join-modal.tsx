import { createDialog } from "@/components/create-dialog";
import TableColumnCombobox from "@/components/gui/table-combobox/TableColumnCombobox";
import TableCombobox from "@/components/gui/table-combobox/TableCombobox";
import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { produce } from "immer";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import DataCatalogDriver, { DataCatalogTableRelationship } from "./driver";

interface IRelationship extends Omit<DataCatalogTableRelationship, "id"> {
  id?: string;
}
export const virtualJoinDialog = createDialog<{
  driver: DataCatalogDriver;
  relation: IRelationship;
}>(({ driver, relation, close }) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<IRelationship>(() =>
    structuredClone(relation)
  );

  const createUpdateVirtualJoin = useCallback(() => {
    setLoading(true);

    if (value?.id) {
      // Update
      driver
        .updateVirtualJoin({ ...value, id: value.id })
        .then(() => {
          close(undefined);
          toast.success("Virtaul join updated");
        })
        .catch()
        .finally(() => setLoading(false));
    } else {
      // Create
      driver
        .addVirtualJoin(value)
        .then(() => {
          close(undefined);
          toast.success("Virtaul join created");
        })
        .catch()
        .finally(() => setLoading(false));
    }
  }, [driver, value, close]);

  const disabled = useMemo(
    () =>
      !value.referenceTableName ||
      !value.referenceColumnName ||
      !value.columnName,
    [value]
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {value.id ? "Edit" : "Add Relationship"} to {value.tableName}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-base">
        Use virtual relationships to connect fields that don&apos;t have a
        direct foreign key link. For example, if two tables should be related by
        email or title but don&apos;t have a formal foreign key, use these
        virtual relationships to link them.
      </DialogDescription>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Column</Label>
        </div>
        <TableColumnCombobox
          value={value.columnName}
          schemaName={value.schemaName}
          tableName={value.tableName}
          onChange={(value) => {
            setValue((prev) =>
              produce(prev, (draft) => {
                draft.columnName = value;
              })
            );
          }}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Relationship Table</Label>
          </div>
          <TableCombobox
            value={value.referenceTableName}
            schemaName={value.schemaName}
            onChange={(value) => {
              setValue((prev) =>
                produce(prev, (draft) => {
                  draft.referenceTableName = value;
                  draft.referenceColumnName = "";
                })
              );
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Relationship Column</Label>
          </div>
          <TableColumnCombobox
            value={value.referenceColumnName}
            schemaName={value.schemaName}
            tableName={value.referenceTableName}
            onChange={(value) => {
              setValue((prev) =>
                produce(prev, (draft) => {
                  draft.referenceColumnName = value;
                })
              );
            }}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          loading={loading}
          variant="secondary"
          disabled={disabled}
          onClick={createUpdateVirtualJoin}
          title={value.id ? "Edit Relationship" : "Create Relationship"}
        />

        <div className="flex-1" />
      </DialogFooter>
    </>
  );
});

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
import {
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogVirtualColumnInput,
} from "@/outerbase-cloud/api-type";
import { produce } from "immer";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { defaultVirtualColumn } from "./constant";
import DataCatalogDriver from "./driver";

interface Props {
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  data?: OuterbaseDataCatalogComment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VirtualJoinModal({
  tableName,
  schemaName,
  driver,
  data,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [virtualColumnInput, setVirtaulColumnInput] =
    useState<OuterbaseDataCatalogVirtualColumnInput>(() => {
      if (data) {
        return {
          ...data,
          body: data.body,
          flags: data.flags,
          sample_data: data.sample_data,
          schema: data.schema,
          table: data.table,
          virtual_key_column: data.virtualKeyColumn,
          virtual_key_schema: data.virtualKeySchema,
          virtual_key_table: data.virtualKeyTable,
        };
      } else {
        return {
          ...defaultVirtualColumn,
          schema: schemaName,
          table: tableName,
          virtual_key_schema: schemaName,
        };
      }
    });

  const createUpdateVirtualJoin = useCallback(() => {
    if (!driver) return;
    setLoading(true);
    driver
      .updateColumn(
        schemaName,
        tableName,
        virtualColumnInput,
        data ? data.id : undefined, // when there is data.ID that mean update column
        true // make it true for update update virtual column
      )
      .then(() => {
        onSuccess();
        toast.success(`Virtaul join ${data?.id ? "updated" : "created"}`);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [
    driver,
    schemaName,
    onSuccess,
    tableName,
    virtualColumnInput,
    data,
    onClose,
  ]);

  const disabled = useMemo(
    () => !virtualColumnInput.body || !virtualColumnInput.virtual_key_table,
    [virtualColumnInput]
  );
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {data ? "Edit" : "Add Relationship"} to {tableName}
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
          value={virtualColumnInput.column}
          schemaName={schemaName}
          tableName={tableName}
          onChange={(value) => {
            setVirtaulColumnInput((prev) =>
              produce(prev, (draft) => {
                draft.column = value;
                draft.virtual_key_column = value;
              })
            );
          }}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Relationship Table</Label>
          </div>
          <TableCombobox
            value={virtualColumnInput.virtual_key_table}
            schemaName={schemaName}
            onChange={(value) => {
              setVirtaulColumnInput((prev) =>
                produce(prev, (draft) => {
                  draft.virtual_key_table = value;
                  draft.body = draft.body !== value ? "" : draft.body;
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
            value={virtualColumnInput.body}
            schemaName={schemaName}
            tableName={virtualColumnInput.virtual_key_table}
            onChange={(value) => {
              setVirtaulColumnInput((prev) =>
                produce(prev, (draft) => {
                  draft.body = value;
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
          title={data ? "Edit Relationship" : "Create Relationship"}
        />

        <div className="flex-1" />
      </DialogFooter>
    </>
  );
}

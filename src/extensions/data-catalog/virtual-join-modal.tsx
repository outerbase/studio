import TableColumnCombobox from "@/components/gui/table-combobox/TableColumnCombobox";
import TableCombobox from "@/components/gui/table-combobox/TableCombobox";
import { Button } from "@/components/orbit/button";
import {
  Dialog,
  DialogContent,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultVirtualColumn } from "./constant";
import DataCatalogDriver from "./driver";

interface Props {
  open: boolean;
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  data?: OuterbaseDataCatalogComment;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

export default function VirtualJoinModal({
  open,
  tableName,
  schemaName,
  driver,
  data,
  onClose,
  onOpenChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [virtualColumnInput, setVirtaulColumnInput] =
    useState<OuterbaseDataCatalogVirtualColumnInput>(() => {
      return {
        ...defaultVirtualColumn,
        schema: schemaName,
        virtual_key_schema: schemaName,
        virtual_key_table: tableName,
      };
    });

  const clear = useCallback(() => {
    setVirtaulColumnInput(defaultVirtualColumn);
  }, []);

  useEffect(() => {
    if (data) {
      setVirtaulColumnInput({
        body: data.body,
        column: data.column,
        flags: data.flags,
        sample_data: data.sample_data,
        schema: data.schema,
        table: data.table,
        virtual_key_column: data.virtualKeyColumn,
        virtual_key_schema: data.virtualKeySchema,
        virtual_key_table: data.virtualKeyTable,
      });
    }
  }, [data]);

  const createUpdateVirtualJoin = useCallback(() => {
    if (!driver) return;
    setLoading(true);
    driver
      .updateColumn(
        schemaName,
        tableName,
        virtualColumnInput,
        data ? data.id : undefined,
        true // make it true for update update virtual column
      )
      .then()
      .catch()
      .finally(() => {
        setLoading(false);
        onClose();
        clear();
      });
  }, [driver, schemaName, tableName, virtualColumnInput, data, clear, onClose]);

  const disabled = useMemo(
    () =>
      !virtualColumnInput.body ||
      !virtualColumnInput.table ||
      !virtualColumnInput.column,
    [virtualColumnInput]
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setVirtaulColumnInput({
            ...defaultVirtualColumn,
            schema: schemaName,
            virtual_key_schema: schemaName,
            virtual_key_table: tableName,
          });
        }
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data ? "Edit" : "Add Relationship"} to {tableName}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base">
          Use virtual relationships to connect fields that don&apos;t have a
          direct foreign key link. For example, if two tables should be related
          by email or title but don&apos;t have a formal foreign key, use these
          virtual relationships to link them.
        </DialogDescription>
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Column</Label>
          </div>
          <TableColumnCombobox
            value={virtualColumnInput.body}
            schemaName={schemaName}
            tableName={tableName}
            onChange={(value) => {
              setVirtaulColumnInput((prev) =>
                produce(prev, (draft) => {
                  draft.body = value;
                })
              );
            }}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Relationship Table</Label>
            </div>
            <TableCombobox
              value={virtualColumnInput.table}
              schemaName={schemaName}
              onChange={(value) => {
                setVirtaulColumnInput((prev) =>
                  produce(prev, (draft) => {
                    draft.table = value;
                    draft.column = draft.column !== value ? "" : draft.column;
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
              value={virtualColumnInput.column}
              schemaName={schemaName}
              tableName={virtualColumnInput.table}
              onChange={(value) => {
                setVirtaulColumnInput((prev) =>
                  produce(prev, (draft) => {
                    draft.column = value;
                    draft.virtual_key_column = value;
                  })
                );
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            loading={loading}
            variant="ghost"
            disabled={disabled}
            onClick={createUpdateVirtualJoin}
            title={data ? "Edit Relationship" : "Create Virtual Join"}
          />

          <div className="flex-1" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

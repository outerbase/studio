import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogVirtualColumnInput,
} from "@/outerbase-cloud/api-type";
import { produce } from "immer";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import DataCatalogDriver from "./driver";

interface DataCatalogTableColumnModalProps {
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  onClose: () => void;
  data?: OuterbaseDataCatalogComment;
}

interface TableMetadataInput {
  alias: string;
  body: string;
  flags: { isActive: boolean; isVirtualKey: boolean };
  sample_data: string;
  schema: string;
  table: string;
  unit: string | null;
  virtual_key_column: string;
  virtual_key_schema: string;
  virtual_key_table: string;
}

const defaultMetadata: TableMetadataInput = {
  alias: "",
  body: "",
  flags: { isActive: true, isVirtualKey: false },
  sample_data: "",
  schema: "",
  table: "",
  unit: null,
  virtual_key_column: "",
  virtual_key_schema: "",
  virtual_key_table: "",
};
export default function TableMetadataModal({
  driver,
  schemaName,
  tableName,
  onClose,
  data,
}: DataCatalogTableColumnModalProps) {
  const [metadataInput, setMetadataInput] = useState<TableMetadataInput>(() => {
    if (data) {
      return {
        alias: data.alias || "",
        body: data.body,
        flags: data.flags,
        sample_data: data.sample_data,
        schema: data.schema,
        table: data.table,
        unit: data.unit,
        virtual_key_column: "",
        virtual_key_schema: "",
        virtual_key_table: "",
      };
    }
    return {
      ...defaultMetadata,
      alias: tableName,
    };
  });

  const [loading, setLoading] = useState(false);

  const onSaveUpdateColumn = useCallback(() => {
    setLoading(true);
    const metaInput = {
      ...metadataInput,
      alias: metadataInput.alias || tableName,
    } as unknown as OuterbaseDataCatalogVirtualColumnInput;

    driver
      .updateTable(schemaName, tableName, metaInput, data?.id)
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [driver, onClose, metadataInput, schemaName, tableName]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Table Metadata: {tableName}</DialogTitle>
      </DialogHeader>
      <DialogDescription>Add metadata to your...</DialogDescription>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Table Pseudonym</Label>
          <Input
            value={metadataInput.alias}
            onChange={(e) => {
              setMetadataInput((prev) =>
                produce(prev, (draft) => {
                  draft.alias = e.target.value;
                })
              );
            }}
            placeholder="Add a Pseudonym"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Table Description</Label>
          <Textarea
            value={metadataInput.body}
            rows={4}
            onChange={(e) => {
              setMetadataInput((prev) => {
                return produce(prev, (draft) => {
                  draft.body = e.target.value;
                });
              });
            }}
            placeholder="Add a description"
          />
        </div>
      </div>

      <DialogFooter>
        <Button disabled={loading} onClick={onSaveUpdateColumn}>
          {loading && <LucideLoader className="mr-1 h-4 w-4 animate-spin" />}
          Save
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
}

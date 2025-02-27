import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { produce } from "immer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDataCatalogContext } from "./data-model-tab";
import { DataCatalogTableMetadata } from "./driver";

interface DataCatalogTableColumnModalProps {
  schemaName: string;
  tableName: string;
  onClose: () => void;
  data?: DataCatalogTableMetadata;
}

export default function TableMetadataModal({
  schemaName,
  tableName,
  onClose,
  data,
}: DataCatalogTableColumnModalProps) {
  const { driver } = useDataCatalogContext();
  const [metadataInput, setMetadataInput] = useState<DataCatalogTableMetadata>(
    () => {
      if (data) return data;
      return {
        alias: tableName,
        definition: "",
        columnName: "",
        tableName: tableName,
        samples: [],
        schemaName: schemaName,
        hide: false,
      };
    }
  );

  const [loading, setLoading] = useState(false);

  const onSaveUpdateColumn = useCallback(() => {
    setLoading(true);

    driver
      .updateTable(schemaName, tableName, {
        alias: metadataInput.alias,
        definition: metadataInput.definition,
        tableName: tableName,
        schemaName: schemaName,
        columnName: metadataInput.columnName,
        samples: [],
        hide: true,
      })
      .then(() => {
        toast.success(`Metatdata ${data ? "updated" : "created"}`);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [driver, onClose, metadataInput, schemaName, data, tableName]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Table Metadata: {tableName}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-base">
        Add metadata to your...
      </DialogDescription>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Table Pseudonym</Label>
          <Input
            value={metadataInput.alias}
            onValueChange={(value) => {
              setMetadataInput((prev) =>
                produce(prev, (draft) => {
                  draft.alias = value;
                })
              );
            }}
            placeholder="Add a Pseudonym"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Table Description</Label>
          <Textarea
            value={metadataInput.definition}
            rows={4}
            onChange={(e) => {
              setMetadataInput((prev) => {
                return produce(prev, (draft) => {
                  draft.definition = e.target.value;
                });
              });
            }}
            className="text-base"
            placeholder="Add a description"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          loading={loading}
          title="Save"
          disabled={loading}
          onClick={onSaveUpdateColumn}
          shape="base"
        />

        <Button title="Cancel" variant="ghost" onClick={onClose} />
      </DialogFooter>
    </>
  );
}

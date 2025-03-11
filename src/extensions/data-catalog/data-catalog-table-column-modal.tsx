import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudioContext } from "@/context/driver-provider";
import { MagicWand } from "@phosphor-icons/react";
import { produce } from "immer";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import { useDataCatalogContext } from "./data-model-tab";
import { DataCatalogColumnInput } from "./driver";

interface DataCatalogTableColumnModalProps {
  schemaName: string;
  tableName: string;
  columnName: string;
  onClose: () => void;
}
export default function DataCatalogTableColumnModal({
  schemaName,
  tableName,
  columnName,
  onClose,
}: DataCatalogTableColumnModalProps) {
  const { driver } = useDataCatalogContext();
  const modelColumn = driver.getColumn(schemaName, tableName, columnName);

  const { databaseDriver } = useStudioContext();
  const [column, setColumn] = useState<DataCatalogColumnInput>(() => ({
    definition: modelColumn?.definition || "",
    samples: modelColumn?.samples || [],
    hide: modelColumn?.hide || false,
  }));

  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const onAutomaticSampleData = useCallback(() => {
    setSampleLoading(true);
    databaseDriver
      .query(
        `SELECT DISTINCT ${databaseDriver.escapeId(columnName)} FROM ${databaseDriver.escapeId(schemaName)}.${databaseDriver.escapeId(tableName)} LIMIT 10`
      )
      .then((r) => {
        setColumn((prev) =>
          produce(prev, (draft) => {
            const row = r.rows.map((row) => row[columnName]);
            draft.samples = row as string[];
          })
        );
      })
      .finally(() => setSampleLoading(false));
  }, [databaseDriver, columnName, schemaName, tableName]);

  const onSaveUpdateColumn = useCallback(() => {
    setLoading(true);

    const data: DataCatalogColumnInput = {
      definition: column.definition,
      samples: column.samples,
      hide: column.hide,
    };

    driver
      .updateColumn(schemaName, tableName, columnName, data)
      .then()
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [driver, column, columnName, onClose, schemaName, tableName]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Column Metadata</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-base">
        Add metadata to this column to help your team and AI understand its
        purpose. Include detailed descriptions and examples of sample data to
        make the data more clear and easier to use.
      </DialogDescription>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Column Description</Label>
          <Textarea
            rows={4}
            value={column.definition}
            onChange={(e) => {
              setColumn((prev) =>
                produce(prev, (draft) => {
                  draft.definition = e.target.value;
                })
              );
            }}
            placeholder="Please provide the definition of a column. This is intended to enhance AI functionality."
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Sample Data</Label>
            <div>
              <Button size="sm" onClick={onAutomaticSampleData}>
                {sampleLoading ? (
                  <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MagicWand className="mr-2 h-4 w-4" />
                )}
                Automatically Generate Sample Data
              </Button>
            </div>
          </div>
          <Textarea
            rows={4}
            value={column.samples}
            onChange={(e) => {
              setColumn((prev) => {
                return produce(prev, (draft) => {
                  draft.samples = e.target.value.split(",");
                });
              });
            }}
            placeholder="Please provide the definition of a column. This is intended to enhance AI functionality."
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          loading={loading}
          title="Save"
          disabled={loading || !column.definition}
          onClick={onSaveUpdateColumn}
        />
      </DialogFooter>
    </>
  );
}

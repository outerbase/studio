import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDatabaseDriver } from "@/context/driver-provider";
import { MagicWand } from "@phosphor-icons/react";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import DataCatalogDriver from "./driver";

interface DataCatalogTableColumnModalProps {
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  columnName: string;
  onClose: () => void;
}

export default function DataCatalogTableColumnModal({
  driver,
  schemaName,
  tableName,
  columnName,
  onClose,
}: DataCatalogTableColumnModalProps) {
  const modelColumn = driver.getColumn(schemaName, tableName, columnName);
  const { databaseDriver } = useDatabaseDriver();

  const [definition, setDefinition] = useState(modelColumn?.definition ?? "");
  const [samples, setSamples] = useState(
    (modelColumn?.samples ?? []).join(",")
  );

  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const onAutomaticSampleData = useCallback(() => {
    setSampleLoading(true);
    databaseDriver
      .query(
        `SELECT DISTINCT ${databaseDriver.escapeId(columnName)} FROM ${databaseDriver.escapeId(schemaName)}.${databaseDriver.escapeId(tableName)} LIMIT 10`
      )
      .then((r) => {
        setSamples(r.rows.map((row) => row[columnName]).join(", "));
      })
      .finally(() => setSampleLoading(false));
  }, [databaseDriver, columnName, schemaName, tableName]);

  const onSaveUpdateColumn = useCallback(() => {
    setLoading(true);

    driver
      .updateColumn(schemaName, tableName, columnName, {
        definition,
        samples:
          samples && samples.trim()
            ? samples.split(",").map((s) => s.trim())
            : [],
        hideFromEzql: modelColumn?.hideFromEzql ?? false,
      })
      .then((r) => {
        console.log(r);
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [
    driver,
    modelColumn,
    samples,
    columnName,
    onClose,
    schemaName,
    tableName,
    definition,
  ]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Column Metadata</DialogTitle>
        <DialogDescription>
          Add metadata to this column to help your team and AI understand its
          purpose. Include detailed descriptions and examples of sample data to
          make the data more clear and easier to use.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Column Description</Label>
          <Textarea
            rows={4}
            value={definition}
            onChange={(e) => setDefinition(e.currentTarget.value)}
            placeholder="Please provide the definition of a column. This is intended to enhance AI functionality."
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Sample Data</Label>
            <div>
              <Button
                size="sm"
                variant={"outline"}
                onClick={onAutomaticSampleData}
              >
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
            value={samples}
            onChange={(e) => setSamples(e.currentTarget.value)}
            placeholder="Please provide the definition of a column. This is intended to enhance AI functionality."
          />
        </div>
      </div>

      <DialogFooter>
        <Button disabled={loading} onClick={onSaveUpdateColumn}>
          {loading && <LucideLoader className="mr-1 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

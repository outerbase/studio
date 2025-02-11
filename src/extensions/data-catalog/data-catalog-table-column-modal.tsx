import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDatabaseDriver } from "@/context/driver-provider";
import { OuterbaseDataCatalogVirtualColumnInput } from "@/outerbase-cloud/api-type";
import { MagicWand } from "@phosphor-icons/react";
import { produce } from "immer";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import { defaultVirtualColumn } from "./constant";
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
  const [column, setColumn] = useState<OuterbaseDataCatalogVirtualColumnInput>(
    () => {
      if (modelColumn) {
        return {
          body: modelColumn.body,
          column: modelColumn.column,
          flags: modelColumn.flags,
          sample_data: modelColumn.sample_data,
          schema: modelColumn.schema,
          table: modelColumn.table,
          virtual_key_column: modelColumn.virtualKeyColumn,
          virtual_key_schema: modelColumn.virtualKeySchema,
          virtual_key_table: modelColumn.virtualKeyTable,
        };
      } else {
        return {
          ...defaultVirtualColumn,
          flags: {
            isActive: true,
            isVirtualKey: false,
          },
          schema: schemaName,
          table: tableName,
          column: columnName,
          virtual_key_schema: schemaName,
          virtual_key_table: tableName,
        };
      }
    }
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
        setColumn((prev) =>
          produce(prev, (draft) => {
            draft.sample_data = r.rows.map((row) => row[columnName]).join(", ");
          })
        );
      })
      .finally(() => setSampleLoading(false));
  }, [databaseDriver, columnName, schemaName, tableName]);

  const onSaveUpdateColumn = useCallback(() => {
    setLoading(true);
    driver
      .updateColumn(schemaName, tableName, column, modelColumn?.id)
      .then()
      .finally(() => {
        setLoading(false);
        onClose();
      });
  }, [driver, column, onClose, schemaName, tableName, modelColumn]);

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
            value={column.body}
            onChange={(e) => {
              setColumn((prev) =>
                produce(prev, (draft) => {
                  draft.body = e.target.value;
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
            value={column.sample_data}
            onChange={(e) => {
              setColumn((prev) => {
                return produce(prev, (draft) => {
                  draft.sample_data = e.target.value;
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
          disabled={loading || !column.body}
          onClick={onSaveUpdateColumn}
        />
      </DialogFooter>
    </>
  );
}

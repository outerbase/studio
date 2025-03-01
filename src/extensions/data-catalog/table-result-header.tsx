import { Button } from "@/components/orbit/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import DataCatalogDriver from "./driver";

interface DataCatalogResultHeaderProps {
  schemaName: string;
  tableName: string;
  columnName: string;
  driver: DataCatalogDriver;
}

export default function DataCatalogResultHeader({
  schemaName,
  tableName,
  columnName,
  driver,
}: DataCatalogResultHeaderProps) {
  const column = driver.getColumn(schemaName, tableName, columnName);
  const [definition, setDefinition] = useState(column?.definition || "");
  const [loading, setLoading] = useState(false);

  const onSaveClicked = useCallback(() => {
    setLoading(true);

    driver
      .updateColumn(schemaName, tableName, columnName, {
        definition,
        hide: column?.hide || false,
        samples: column?.samples ?? [],
      })
      .then(() => {
        toast.success("Column Definition Updated");
      })
      .catch()
      .finally(() => setLoading(false));
  }, [driver, definition, column, columnName, schemaName, tableName]);

  return (
    <div className="flex flex-col gap-2 border-b p-2 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Data Catalog</h2>

        <Button
          loading={loading}
          title="Save"
          shape="base"
          variant="primary"
          size="sm"
          onClick={onSaveClicked}
        />
      </div>

      <Textarea
        placeholder="Please provide the definition of a column. This is intended to enhance AI functionality."
        className="resize-none"
        rows={4}
        value={definition}
        onChange={(e) => setDefinition(e.currentTarget.value)}
      />
    </div>
  );
}

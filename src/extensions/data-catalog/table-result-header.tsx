import { Textarea } from "@/components/ui/textarea";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
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
  const [definition, setDefinition] = useState(column?.definition ?? "");
  const [loading, setLoading] = useState(false);

  const onSaveClicked = useCallback(() => {
    setLoading(true);
    driver
      .updateColumn(schemaName, tableName, columnName, {
        definition,
        hideFromEzql: column?.hideFromEzql ?? false,
        samples: column?.samples ?? [],
      })
      .then()
      .catch()
      .finally(() => setLoading(false));
  }, [driver, definition, column, schemaName, tableName, columnName]);

  return (
    <div className="flex flex-col gap-2 border-b p-2 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold">Data Catalog</h2>
        <button
          className="bg-primary text-primary-foreground flex cursor-pointer items-center rounded p-1 px-3 text-xs"
          onClick={onSaveClicked}
          disabled={loading}
        >
          {loading && <LucideLoader className="mr-1 h-3 w-3 animate-spin" />}
          Save
        </button>
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

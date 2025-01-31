import SchemaNameSelect from "@/components/gui/schema-editor/schema-name-select";
import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import HighlightText from "@/components/ui/highlight-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfig } from "@/context/config-provider";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import {
  DatabaseTableColumn,
  DatabaseTableSchema,
} from "@/drivers/base-driver";
import { MagicWand } from "@phosphor-icons/react";
import { LucideLoader, LucideMoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DataCatalogExtension from ".";
import DataCatalogDriver from "./driver";

interface DataCatalogTableColumnModalProps {
  driver: DataCatalogDriver;
  schemaName: string;
  tableName: string;
  columnName: string;
  onClose: () => void;
}

function DataCatalogTableColumnModal({
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
      .then()
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

interface DataCatalogTableColumnProps {
  table: DatabaseTableSchema;
  column: DatabaseTableColumn;
  driver: DataCatalogDriver;
  search?: string;
  hasDefinitionOnly?: boolean;
}

function DataCatalogTableColumn({
  column,
  table,
  driver,
  search,
  hasDefinitionOnly,
}: DataCatalogTableColumnProps) {
  const modelColumn = driver.getColumn(
    table.schemaName,
    table.tableName!,
    column.name
  );

  const definition = modelColumn?.definition;
  const sampleData = modelColumn?.samples ?? [];

  const [open, setOpen] = useState(false);

  if (hasDefinitionOnly && !definition) {
    return null;
  }

  return (
    <div key={column.name} className="flex border-t">
      <div className="flex w-[150px] items-center p-2">
        <HighlightText text={column.name} highlight={search} />
      </div>
      <div className="text-muted-foreground flex-1 p-2">
        {definition || "No description"}
      </div>
      <div className="w-[150px] p-2">
        {sampleData.length > 0 && (
          <span className="bg-secondary rounded p-1 px-2 text-xs">
            {sampleData.length} sample data
          </span>
        )}
      </div>
      <div className="flex w-[50px] items-center justify-center p-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <LucideMoreHorizontal className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent>
            {open && (
              <DataCatalogTableColumnModal
                driver={driver}
                schemaName={table.schemaName}
                tableName={table.tableName!}
                columnName={column.name}
                onClose={() => setOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface DataCatalogTableAccordionProps {
  table: DatabaseTableSchema;
  driver: DataCatalogDriver;
  search?: string;
  columnName?: string;
  hasDefinitionOnly?: boolean;
}

function DataCatalogTableAccordion({
  table,
  driver,
  search,
  hasDefinitionOnly,
}: DataCatalogTableAccordionProps) {
  const modelTable = driver.getTable(table.schemaName, table.tableName!);

  const [definition, setDefinition] = useState(modelTable?.definition || "");

  const onUpdateTable = useCallback(() => {
    if (
      definition &&
      definition.trim() &&
      definition !== modelTable?.definition
    ) {
      driver.updateTable(table?.schemaName, table.tableName!, {
        definition,
      });
    }
  }, [driver, table, definition, modelTable]);

  // Check if any of the column match?
  const matchColumns = useMemo(() => {
    if (!search || search.toLowerCase() === table.tableName!.toLowerCase()) {
      return table.columns;
    }
    return table.columns.filter((column) =>
      column.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, table]);

  const matchedTableName = useMemo(() => {
    if (search) {
      return table.tableName!.toLowerCase().includes(search?.toLowerCase());
    }
    return true;
  }, [search, table]);

  // this will work only toggle check box
  if (hasDefinitionOnly) {
    const columnsDefinition = table.columns
      .map((col) => {
        const modelColumn = driver.getColumn(
          table.schemaName,
          table.tableName!,
          col.name
        );
        return !!modelColumn?.definition;
      })
      .filter(Boolean);

    if (columnsDefinition.length === 0) {
      return null;
    }
  }

  if (!matchedTableName && matchColumns.length === 0 && search) {
    return null;
  }

  return (
    <div className="rounded-lg border text-sm">
      <div className="p-2">
        <div className="font-bold">{table.tableName}</div>
        <input
          value={definition}
          placeholder="No description"
          onBlur={onUpdateTable}
          onChange={(e) => {
            e.preventDefault();
            setDefinition(e.currentTarget.value);
          }}
          className="h-[30px] w-[150px] p-0 text-[13px] focus-visible:outline-none"
        />
      </div>
      {matchColumns.map((column) => {
        return (
          <DataCatalogTableColumn
            key={column.name}
            table={table}
            column={column}
            driver={driver}
            search={search}
            hasDefinitionOnly={hasDefinitionOnly}
          />
        );
      })}
    </div>
  );
}

export default function DataCatalogModelTab() {
  const { currentSchemaName, schema } = useSchema();
  const [search, setSearch] = useState("");
  const [hasDefinitionOnly, setHasDefinitionOnly] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);

  const { extensions } = useConfig();

  const dataCatalogExtension =
    extensions.getExtension<DataCatalogExtension>("data-catalog");

  const driver = dataCatalogExtension?.driver;

  const currentSchema = useMemo(() => {
    if (!selectedSchema) return [];
    const result = (schema[selectedSchema] || [])
      .filter((table) => table.type === "table")
      .map((table) => table.tableSchema)
      .filter(Boolean) as DatabaseTableSchema[];

    result.sort((a, b) => a.tableName!.localeCompare(b.tableName!));
    return result;
  }, [schema, selectedSchema]);

  if (!driver) {
    return <div>Missing driver</div>;
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="border-b p-1">
        <Toolbar>
          <SchemaNameSelect
            value={selectedSchema}
            onChange={setSelectedSchema}
          />
          <div className="ml-2 flex items-center gap-2">
            <Checkbox
              checked={hasDefinitionOnly}
              onCheckedChange={() => setHasDefinitionOnly(!hasDefinitionOnly)}
            />
            <label className="text-sm">Definition only?</label>
          </div>
          <ToolbarFiller />
          <div>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
              }}
              placeholder="Search tables, columns"
            />
          </div>
        </Toolbar>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {currentSchema.map((table) => (
          <DataCatalogTableAccordion
            search={search}
            key={table.tableName}
            table={table}
            driver={driver}
            hasDefinitionOnly={hasDefinitionOnly}
          />
        ))}
      </div>
    </div>
  );
}

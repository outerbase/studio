import SchemaNameSelect from "@/components/gui/schema-editor/schema-name-select";
import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/context/config-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseTableSchema } from "@/drivers/base-driver";
import { useCallback, useEffect, useState } from "react";
import DataCatalogExtension from ".";
import DataCatalogTableAccordion from "./data-catalog-table-accordion";

export default function DataCatalogModelTab() {
  const { currentSchemaName, schema } = useSchema();
  const [search, setSearch] = useState("");
  const [hasDefinitionOnly, setHasDefinitionOnly] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);

  const { extensions } = useConfig();
  const [schemas, setSchemas] = useState<DatabaseTableSchema[]>([]);
  const dataCatalogExtension =
    extensions.getExtension<DataCatalogExtension>("data-catalog");

  const driver = dataCatalogExtension?.driver;

  const onRefresh = useCallback(() => {
    if (!selectedSchema) return [];
    const result = (schema[selectedSchema] || [])
      .filter((table) => table.type === "table")
      .map((table) => table.tableSchema)
      .filter(Boolean) as DatabaseTableSchema[];

    result.sort((a, b) => a.tableName!.localeCompare(b.tableName!));

    setSchemas(result);
  }, [schema, selectedSchema]);

  useEffect(() => {
    if (!driver) return;

    const onRefresh = () => {
      if (!selectedSchema) return [];
      const result = (schema[selectedSchema] || [])
        .filter((table) => table.type === "table")
        .map((table) => table.tableSchema)
        .filter(Boolean) as DatabaseTableSchema[];

      result.sort((a, b) => a.tableName!.localeCompare(b.tableName!));

      setSchemas(result);
    };

    onRefresh();

    const unsubscribe = driver.addEventListener(onRefresh);

    return () => unsubscribe;
  }, [onRefresh, driver, schema, selectedSchema]);

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
        {schemas.map((table) => (
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

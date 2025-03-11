import SchemaNameSelect from "@/components/gui/schema-editor/schema-name-select";
import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Input } from "@/components/orbit/input";
import { Toggle } from "@/components/orbit/toggle";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseTableSchema } from "@/drivers/base-driver";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import DataCatalogExtension from ".";
import DataCatalogTableAccordion from "./data-catalog-table-accordion";
import DataCatalogDriver from "./driver";

const DataCatalogContext = createContext<{
  driver: DataCatalogDriver;
  search: string;
}>({
  driver: new Proxy({}, {}) as DataCatalogDriver,
  search: "",
});

export function useDataCatalogContext() {
  return useContext(DataCatalogContext);
}

export default function DataCatalogModelTab() {
  const { currentSchemaName, schema: schemaList } = useSchema();
  const [search, setSearch] = useState("");
  const [hasDefinitionOnly, setHasDefinitionOnly] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRevision] = useState(1);

  const { extensions } = useStudioContext();

  const driver = useMemo(() => {
    const dataCatalogExtension =
      extensions.getExtension<DataCatalogExtension>("data-catalog");
    return dataCatalogExtension?.driver as DataCatalogDriver;
  }, [extensions]);

  const schemas = useMemo(() => {
    const result = (schemaList[selectedSchema] || [])
      .filter((table) => table.type === "table")
      .map((table) => table.tableSchema)
      .filter(Boolean) as DatabaseTableSchema[];

    result.sort((a, b) => a.tableName!.localeCompare(b.tableName!));

    return result;
  }, [selectedSchema, schemaList]);

  useEffect(() => {
    return driver.listen(() => {
      setRevision((prev) => prev + 1);
    });
  }, [driver, setRevision]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <DataCatalogContext.Provider value={{ driver, search }}>
        <div className="border-b p-1">
          <Toolbar>
            <SchemaNameSelect
              value={selectedSchema}
              onChange={setSelectedSchema}
            />
            <div className="ml-2 flex items-center gap-2">
              <Toggle
                toggled={hasDefinitionOnly}
                size="sm"
                onChange={setHasDefinitionOnly}
              />
              <label className="text-base">Definition only?</label>
            </div>
            <ToolbarFiller />
            <div>
              <Input
                value={search}
                onValueChange={setSearch}
                preText={<MagnifyingGlass className="mr-2" />}
                placeholder="Search tables, columns"
              />
            </div>
          </Toolbar>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {schemas.map((table, index) => (
            <DataCatalogTableAccordion
              key={index}
              table={table}
              driver={driver}
              hasDefinitionOnly={hasDefinitionOnly}
            />
          ))}
        </div>
      </DataCatalogContext.Provider>
    </div>
  );
}

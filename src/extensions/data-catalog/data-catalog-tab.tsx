import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/config-provider";
import { useSchema } from "@/context/schema-provider";
import { useMemo, useState } from "react";
import DataCatalogExtension from ".";
import { DataCatalogEntryModal } from "./components/data-catalog-entry-modal";
import EmptyTermDefinition from "./components/empty-definition";

export default function DataCatalogTab() {
  const { currentSchemaName } = useSchema();
  const { extensions } = useConfig();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTermDefinition, setSeletedTermDefinition] = useState("");
  const dataCatalogExtension =
    extensions.getExtension<DataCatalogExtension>("data-catalog");

  const driver = dataCatalogExtension?.driver;
  const currentTermDefinition = useMemo(() => {
    const definitions = driver?.getTermDefinitions(currentSchemaName);
    return definitions;
  }, [driver, currentSchemaName]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b p-1">
        <Toolbar>
          <div>Data Catalog</div>
          <ToolbarFiller />
          <DataCatalogEntryModal
            selectedTermDefinition={selectedTermDefinition}
            open={open}
            onClose={() => setOpen(false)}
            driver={driver}
            schemaName={currentSchemaName}
          />
        </Toolbar>
      </div>
      <div className="flex-1 gap-5 overflow-scroll p-10">
        <div className="w-[450px]">
          <div className="text-3xl font-bold">
            Get started with Data Catalog
          </div>
          <div className="text-sm">
            Provide explanations for terminology in your schema. EZQL will use
            this to make running queries more efficient and accurate.
          </div>
        </div>
        <EmptyTermDefinition />
        <Button className="mt-10 mb-10">Create your first entry</Button>
      </div>
    </div>
  );
}

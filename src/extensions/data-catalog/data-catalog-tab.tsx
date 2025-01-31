import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/config-provider";
import { useState } from "react";
import DataCatalogExtension from ".";
import { DataCatalogEntryModal } from "./components/data-catalog-entry-modal";
import EmptyTermDefinition from "./components/empty-definition";
import TermDefinitionList from "./components/term-definition-list";
import { DataCatalogTermDefinition } from "./driver";

export default function DataCatalogTab() {
  const { extensions } = useConfig();
  const dataCatalogExtension =
    extensions.getExtension<DataCatalogExtension>("data-catalog");
  const driver = dataCatalogExtension?.driver;

  const [open, setOpen] = useState(false);

  const [dataCatalog, setDataCatalog] = useState<DataCatalogTermDefinition[]>(
    () => {
      return driver?.getTermDefinitions() || [];
    }
  );

  const [selectedTermDefinition, setSeletedTermDefinition] =
    useState<DataCatalogTermDefinition>();

  function onSuccess() {
    setDataCatalog(driver?.getTermDefinitions() || []);
  }

  function onOpenModal() {
    setOpen(true);
    setSeletedTermDefinition(undefined);
  }

  if (!driver) {
    return <div>Missing driver</div>;
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b p-1">
        <Toolbar>
          <div>Data Catalog</div>
          <ToolbarFiller />
          <Button size="sm" onClick={onOpenModal}>
            Add Entry
          </Button>
          <DataCatalogEntryModal
            selectedTermDefinition={selectedTermDefinition}
            open={open}
            onClose={setOpen}
            driver={driver}
            onSuccess={onSuccess}
          />
        </Toolbar>
      </div>
      <div className="flex-1 gap-5 overflow-scroll p-10 pb-0">
        <div className="w-[450px]">
          <div className="text-3xl font-bold">
            {dataCatalog?.length === 0
              ? "Get started with Data Catalog"
              : "Definitions"}
          </div>
          <div className="text-sm">
            {dataCatalog?.length === 0
              ? " Provide explanations for terminology in your schema. EZQL will use this to make running queries more efficient and accurate."
              : "Defined terms to be used in your product."}
          </div>
        </div>
        {dataCatalog?.length === 0 ? (
          <EmptyTermDefinition />
        ) : (
          <TermDefinitionList
            data={dataCatalog}
            onSelect={(item) => {
              setSeletedTermDefinition(item);
              setOpen(true);
            }}
          />
        )}
        <Button className="mt-10 mb-10" onClick={onOpenModal}>
          {dataCatalog?.length === 0 ? "Create your first entry" : "Add Entry"}
        </Button>
      </div>
    </div>
  );
}

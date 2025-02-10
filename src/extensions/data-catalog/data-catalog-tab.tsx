import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/config-provider";
import { OuterbaseDataCatalogDefinition } from "@/outerbase-cloud/api-type";
import { useEffect, useState } from "react";
import DataCatalogExtension from ".";
import { DataCatalogEntryModal } from "./data-catalog-entry-modal";
import EmptyTermDefinition from "./empty-definition";
import TermDefinitionList from "./term-definition-list";

export default function DataCatalogTab() {
  const { extensions } = useConfig();
  const dataCatalogExtension =
    extensions.getExtension<DataCatalogExtension>("data-catalog");
  const driver = dataCatalogExtension?.driver;

  const [open, setOpen] = useState(false);

  const [dataCatalog, setDataCatalog] = useState<
    OuterbaseDataCatalogDefinition[]
  >([]);

  const [definition, setDefinition] =
    useState<OuterbaseDataCatalogDefinition>();

  useEffect(() => {
    const getDataCatalog = () => {
      setDataCatalog(driver?.getTermDefinitions() || []);
    };

    getDataCatalog();

    const unsubscribe = driver?.addEventListener(getDataCatalog);

    return () => unsubscribe;
  }, []);

  function onOpenModal() {
    setOpen(true);
    setDefinition(undefined);
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
            open={open}
            onClose={setOpen}
            driver={driver}
            definition={definition}
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
              setDefinition(item);
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

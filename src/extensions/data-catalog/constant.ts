import { OuterbaseDataCatalogVirtualColumnInput } from "@/outerbase-cloud/api-type";

export const defaultVirtualColumn: OuterbaseDataCatalogVirtualColumnInput = {
  body: "",
  flags: {
    isActive: true,
    isVirtualKey: true,
  },
  sample_data: "",
  schema: "",
  table: "",
  virtual_key_column: "",
  virtual_key_schema: "",
  virtual_key_table: "",
};

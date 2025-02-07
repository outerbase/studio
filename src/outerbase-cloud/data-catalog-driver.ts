import DataCatalogDriver from "@/extensions/data-catalog/driver";
import { OuterbaseDatabaseConfig } from "./api-type";

export default class DataCatalogOuterbaseDriver implements DataCatalogDriver {
  protected config: OuterbaseDatabaseConfig

  constructor(config: OuterbaseDatabaseConfig) {
    this.config = config;
  }

  // do something here
}
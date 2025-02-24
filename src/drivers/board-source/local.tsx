import { SavedConnectionRawLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import { BaseDriver, DatabaseResultSet, DatabaseSchemas } from "../base-driver";
import { createLocalDriver } from "../helpers";
import { BoardSource, BoardSourceDriver } from "./base-source";

export default class LocalBoardSource extends BoardSourceDriver {
  protected sources: SavedConnectionRawLocalStorage[];
  protected drivers: Record<string, BaseDriver> = {};

  protected cacheSchemas: Record<
    string,
    {
      schema: DatabaseSchemas;
      selectedSchema: string;
    }
  > = {};

  constructor(sources: SavedConnectionRawLocalStorage[]) {
    super();
    this.sources = sources;
  }

  sourceList(): BoardSource[] {
    return this.sources.map((source) => {
      return {
        id: source.id!,
        name: source.name,
        type: source.driver ?? "sqlite",
      };
    });
  }

  getDriver(sourceId: string) {
    const source = this.sources.find((s) => s.id === sourceId);

    if (!source) {
      throw new Error("Source does not exist");
    }

    if (!this.drivers[sourceId]) {
      this.drivers[sourceId] = createLocalDriver(source);
    }

    return this.drivers[sourceId];
  }

  query(sourceId: string, statement: string): Promise<DatabaseResultSet> {
    const driver = this.getDriver(sourceId);

    if (!driver) {
      throw new Error("Soruce does not exist");
    }

    return driver.query(statement);
  }

  async schemas(sourceId: string) {
    const driver = this.getDriver(sourceId);

    if (this.cacheSchemas[sourceId]) {
      return this.cacheSchemas[sourceId];
    }

    this.cacheSchemas[sourceId] = {
      schema: await driver.schemas(),
      selectedSchema: driver.getFlags().defaultSchema,
    };

    return this.cacheSchemas[sourceId];
  }

  cleanup(): void {
    // do nothing
  }
}

import {
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogVirtualColumnInput,
} from "@/outerbase-cloud/api-type";
import DataCatalogDriver, {
  DataCatalogModelTable,
  DataCatalogSchemas,
  DataCatalogTermDefinition,
} from "./driver";

interface DataCatalogInmemoryDriverOptions {
  delay?: number;
}

export default class DataCatalogInmemoryDriver implements DataCatalogDriver {
  protected options: DataCatalogInmemoryDriverOptions;
  private schemas: DataCatalogSchemas;
  private definitions: OuterbaseDataCatalogDefinition[];
  private subscribers: Set<() => void> = new Set();

  constructor(
    schemas: DataCatalogSchemas,
    definitions: OuterbaseDataCatalogDefinition[],
    options: DataCatalogInmemoryDriverOptions
  ) {
    this.schemas = schemas;
    this.options = options;
    this.definitions = definitions;
  }

  private async delay() {
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }
  }

  async load(): Promise<{
    schemas: DataCatalogSchemas;
    definitions: OuterbaseDataCatalogDefinition[];
  }> {
    await this.delay();

    return {
      schemas: this.schemas,
      definitions: this.definitions,
    };
  }

  async updateColumn(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId?: string,
    isVirtual?: boolean
  ): Promise<OuterbaseDataCatalogComment> {
    await this.delay();

    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();

    if (
      this.schemas[normalizedSchemaName] &&
      this.schemas[normalizedSchemaName][normalizedTableName]
    ) {
      const table = this.schemas[normalizedSchemaName][normalizedTableName];

      if (isVirtual) {
        const index = table.virtualJoin.findIndex((vc) => vc.id === commentId);
        if (index > -1) {
          table.virtualJoin[index] = {
            ...table.virtualJoin[index],
            ...data,
          };
        } else {
          table.virtualJoin?.push({
            ...(data as unknown as OuterbaseDataCatalogComment),
          });
        }
      } else {
        table.columns[data.column] = {
          ...table.columns[data.column],
          ...data,
        };
      }
      // notify update driver
      this.notify();
    }

    return data as unknown as OuterbaseDataCatalogComment;
  }

  async updateTable(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId: string
  ): Promise<DataCatalogModelTable | undefined> {
    await this.delay();
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();

    if (!this.schemas[normalizedSchemaName]) {
      this.schemas[normalizedSchemaName] = {};
    }

    const schemas = this.schemas[normalizedSchemaName];

    if (!schemas[normalizedTableName]) {
      schemas[normalizedTableName] = {
        schemaName: normalizedSchemaName,
        tableName: normalizedTableName,
        columns: {},
        virtualJoin: [],
      };
    }
    const table = schemas[normalizedTableName];

    this.schemas[schemaName][tableName] = {
      ...table,
      metadata: {
        ...data,
        ...(commentId ? { commentId } : {}),
      } as unknown as OuterbaseDataCatalogComment,
    };

    this.notify();
    return schemas[normalizedTableName];
  }

  getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): OuterbaseDataCatalogComment | undefined {
    const normalizedColumnName = columnName.toLowerCase();
    const table = this.getTable(schemaName, tableName);
    return table?.columns[normalizedColumnName];
  }
  async deleteVirtualColumn(
    schemaName: string,
    tableName: string,
    id: string
  ): Promise<boolean> {
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();

    if (
      this.schemas[normalizedSchemaName] &&
      this.schemas[normalizedSchemaName][normalizedTableName]
    ) {
      const table = this.schemas[normalizedSchemaName][normalizedTableName];
      table.virtualJoin = table.virtualJoin?.filter((vc) => vc.id !== id) || [];
      // notify update driver
      this.notify();
    }
    return true;
  }

  getTable(
    schemaName: string,
    tableName: string
  ): DataCatalogModelTable | undefined {
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();

    if (!this.schemas[normalizedSchemaName]) {
      return;
    }

    const schemas = this.schemas[normalizedSchemaName];
    if (!schemas[normalizedTableName]) {
      return;
    }

    const table = schemas[normalizedTableName];
    return table;
  }

  getTermDefinitions(): OuterbaseDataCatalogDefinition[] {
    if (!this.definitions) {
      return [];
    }
    return this.definitions;
  }

  async updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<DataCatalogTermDefinition | undefined> {
    await this.delay();

    if (!this.definitions) {
      this.definitions = [];
    }

    const definitions = this.definitions;

    const existingIndex = definitions.findIndex((term) => term.id === data.id);

    if (existingIndex !== -1) {
      definitions[existingIndex] = { ...definitions[existingIndex], ...data };
    } else {
      definitions.unshift(data as OuterbaseDataCatalogDefinition);
    }

    return data;
  }

  async deleteTermDefinition(id: string): Promise<boolean> {
    await this.delay();
    if (!this.definitions) return false;

    const definitions = this.definitions;
    const initialLength = definitions.length;

    this.definitions = definitions.filter((term) => term.id !== id);

    return definitions.length < initialLength;
  }

  addEventListener(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.removeEventListener(callback);
  }

  removeEventListener(callback: () => void) {
    this.subscribers.delete(callback);
  }

  // Notify all subscribers
  private notify() {
    this.subscribers.forEach((callback) => callback());
  }
}

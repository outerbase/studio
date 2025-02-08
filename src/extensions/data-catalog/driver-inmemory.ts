import DataCatalogDriver, {
  DataCatalogModelColumn,
  DataCatalogModelColumnInput,
  DataCatalogModelTable,
  DataCatalogModelTableInput,
  DataCatalogSchemas,
  DataCatalogTermDefinition,
} from "./driver";

interface DataCatalogInmemoryDriverOptions {
  delay?: number;
}

export default class DataCatalogInmemoryDriver implements DataCatalogDriver {
  private schemas: DataCatalogSchemas;
  protected options: DataCatalogInmemoryDriverOptions;
  private definitions: DataCatalogTermDefinition[];

  constructor(
    schemas: DataCatalogSchemas,
    definitions: DataCatalogTermDefinition[],
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
    definitions: DataCatalogTermDefinition[];
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
    columnName: string,
    data: DataCatalogModelColumnInput
  ): Promise<DataCatalogModelColumn> {
    await this.delay();

    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();
    const normalizedColumnName = columnName.toLowerCase();

    if (!this.schemas[normalizedSchemaName]) {
      this.schemas[normalizedSchemaName] = {};
    }

    const schemas = this.schemas[normalizedSchemaName];

    if (!schemas[normalizedTableName]) {
      schemas[normalizedTableName] = {
        schemaName: normalizedSchemaName,
        tableName: normalizedTableName,
        columns: {},
        definition: "",
      };
    }

    const table = schemas[normalizedTableName];
    if (!table.columns[normalizedColumnName]) {
      table.columns[normalizedColumnName] = {
        name: normalizedColumnName,
        definition: "",
        samples: [],
        hideFromEzql: false,
      };
    }

    const column = table.columns[normalizedColumnName];
    table.columns[normalizedColumnName] = { ...column, ...data };
    return table.columns[normalizedColumnName];
  }

  async updateTable(
    schemaName: string,
    tableName: string,
    data: DataCatalogModelTableInput
  ): Promise<DataCatalogModelTable> {
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
        definition: "",
        virtualJoin: [],
      };
    }
    const table = schemas[normalizedTableName];
    schemas[normalizedTableName] = {
      ...table,
      ...data,
    };

    return schemas[normalizedTableName];
  }

  getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): DataCatalogModelColumn | undefined {
    const normalizedColumnName = columnName.toLowerCase();
    const table = this.getTable(schemaName, tableName);
    return table?.columns[normalizedColumnName];
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

  getTermDefinitions(): DataCatalogTermDefinition[] {
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

    const dataCatalog = this.definitions;

    const existingIndex = dataCatalog.findIndex((term) => term.id === data.id);

    if (existingIndex !== -1) {
      dataCatalog[existingIndex] = { ...dataCatalog[existingIndex], ...data };
    } else {
      dataCatalog.unshift(data);
    }

    return data;
  }

  async deleteTermDefinition(id: string): Promise<boolean> {
    await this.delay();
    if (!this.definitions) return false;

    const dataCatalog = this.definitions;
    const initialLength = dataCatalog.length;

    this.definitions = dataCatalog.filter((term) => term.id !== id);

    return dataCatalog.length < initialLength;
  }
}

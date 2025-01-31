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
  private schemas: DataCatalogSchemas = { tables: {}, termDefinitions: [] };
  protected options: DataCatalogInmemoryDriverOptions;

  constructor(
    schemas: DataCatalogSchemas,
    options: DataCatalogInmemoryDriverOptions
  ) {
    this.schemas = schemas;
    this.options = options;
  }

  private async delay() {
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }
  }

  async load(): Promise<DataCatalogSchemas> {
    await this.delay();
    return this.schemas;
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

    if (!this.schemas.tables) {
      this.schemas.tables = {};
    }

    if (!this.schemas.tables[normalizedSchemaName]) {
      this.schemas.tables[normalizedSchemaName] = {};
    }

    const schemas = this.schemas.tables[normalizedSchemaName];

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

    if (!this.schemas.tables || !this.schemas.tables[normalizedSchemaName]) {
      this.schemas.tables[normalizedSchemaName] = {};
    }

    const schemas = this.schemas.tables[normalizedSchemaName];

    if (!schemas[normalizedTableName]) {
      schemas[normalizedTableName] = {
        schemaName: normalizedSchemaName,
        tableName: normalizedTableName,
        columns: {},
        definition: "",
      };
    }

    const table = schemas[normalizedTableName];
    schemas[normalizedTableName] = { ...table, ...data };

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

    if (!this.schemas.tables) {
      return;
    }
    const schemas = this.schemas.tables[normalizedSchemaName];
    return schemas[normalizedTableName];
  }

  getTermDefinitions(): DataCatalogTermDefinition[] | undefined {
    if (!this.schemas.termDefinitions) {
      return;
    }
    return this.schemas.termDefinitions;
  }

  async updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<DataCatalogTermDefinition | undefined> {
    await this.delay();

    if (!this.schemas.termDefinitions) {
      this.schemas.termDefinitions = [];
    }
    const schemaTerms = this.schemas.termDefinitions;

    const existingIndex = schemaTerms.findIndex((term) => term.id === data.id);

    if (existingIndex !== -1) {
      schemaTerms[existingIndex] = { ...schemaTerms[existingIndex], ...data };
    } else {
      schemaTerms.unshift(data);
    }

    return data;
  }

  async deleteTermDefinition(id: string): Promise<boolean> {
    await this.delay();
    if (!this.schemas.termDefinitions) return false;

    const terms = this.schemas.termDefinitions;
    const initialLength = terms.length;

    this.schemas.termDefinitions = terms.filter((term) => term.id !== id);

    return terms.length < initialLength;
  }
}

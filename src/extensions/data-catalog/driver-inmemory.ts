import DataCatalogDriver, {
  DataCatalogModelColumn,
  DataCatalogModelColumnInput,
  DataCatalogModelTable,
  DataCatalogModelTableInput,
  DataCatalogSchemas,
} from "./driver";

interface DataCatalogInmemoryDriverOptions {
  delay?: number;
}

export default class DataCatalogInmemoryDriver implements DataCatalogDriver {
  protected schemas: DataCatalogSchemas;
  protected options: DataCatalogInmemoryDriverOptions;

  constructor(
    schemas: DataCatalogSchemas,
    options: DataCatalogInmemoryDriverOptions
  ) {
    this.schemas = schemas;
    this.options = options;
  }

  async load(): Promise<DataCatalogSchemas> {
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }

    return this.schemas;
  }

  async updateColumn(
    schemaName: string,
    tableName: string,
    columnName: string,
    data: DataCatalogModelColumnInput
  ): Promise<DataCatalogModelColumn> {
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }

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
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }

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
}

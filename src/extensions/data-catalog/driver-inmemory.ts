import DataCatalogDriver, {
  DataCatalogColumn,
  DataCatalogColumnInput,
  DataCatalogSchemas,
  DataCatalogTable,
  DataCatalogTableRelationship,
  DataCatalogTermDefinition,
} from "./driver";

const nanoid = () => Math.random().toString(36).slice(2);

interface DataCatalogInmemoryDriverOptions {
  delay?: number;
}

export default class DataCatalogInmemoryDriver implements DataCatalogDriver {
  private schemas: DataCatalogSchemas;
  protected options: DataCatalogInmemoryDriverOptions;
  private definitions: DataCatalogTermDefinition[];
  private subscribers: Set<() => void> = new Set();

  constructor(
    schemas: DataCatalogSchemas,
    dataCatalog: DataCatalogTermDefinition[],
    options: DataCatalogInmemoryDriverOptions
  ) {
    this.schemas = schemas;
    this.options = options;
    this.definitions = dataCatalog;
  }

  private async delay() {
    if (this.options.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }
  }

  async load(): Promise<{
    definitions: DataCatalogTermDefinition[];
  }> {
    await this.delay();

    return {
      definitions: this.definitions,
    };
  }

  async updateColumn(
    schemaName: string,
    tableName: string,
    columnName: string,
    data: DataCatalogColumnInput
  ): Promise<DataCatalogColumn> {
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
        columns: [],
        relations: [],
      };
    }

    const table = schemas[normalizedTableName];

    const index = table.columns.findIndex(
      (col) =>
        col.columnName?.toLowerCase() === normalizedColumnName &&
        col.schemaName?.toLowerCase() === normalizedSchemaName &&
        col.tableName?.toLowerCase() === normalizedTableName
    );
    if (index > -1) {
      table.columns[index] = {
        ...table.columns[index],
        ...data,
      };
    } else {
      table.columns.push({
        schemaName: normalizedSchemaName,
        tableName: normalizedTableName,
        columnName: normalizedColumnName,
        ...data,
      });
    }

    this.notify();

    return table.columns[index];
  }

  async updateTable(
    schemaName: string,
    tableName: string,
    data: DataCatalogColumn
  ): Promise<DataCatalogTable> {
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
        columns: [],
        relations: [],
      };
    }

    const table = schemas[normalizedTableName];
    schemas[normalizedTableName] = { ...table, ...data };
    this.notify();

    return schemas[normalizedTableName];
  }

  getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): DataCatalogColumn | undefined {
    const normalizedColumnName = columnName.toLowerCase();
    const table = this.getTable(schemaName, tableName);
    const column = table?.columns.find(
      (col) => col.columnName.toLowerCase() === normalizedColumnName
    );
    return column;
  }

  getTable(
    schemaName: string,
    tableName: string
  ): DataCatalogTable | undefined {
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

  async updateVirtualJoin(): Promise<boolean> {
    await this.delay();

    //TODO here

    this.notify();
    return true;
  }

  async addVirtualJoin(
    data: Omit<DataCatalogTableRelationship, "id">
  ): Promise<DataCatalogTableRelationship> {
    await this.delay();

    //TODO here
    this.notify();

    const relation = {
      ...data,
      id: nanoid(),
    };
    return relation;
  }

  async deleteVirtualColumn(): Promise<boolean> {
    this.notify();

    return true;
  }

  getTermDefinitions(): DataCatalogTermDefinition[] {
    if (!this.definitions) {
      return [];
    }
    return this.definitions;
  }
  async addTermDefinition(
    data: Omit<DataCatalogTermDefinition, "id">
  ): Promise<DataCatalogTermDefinition | undefined> {
    await this.delay();

    if (!this.definitions) {
      this.definitions = [];
    }
    const definitions = this.definitions;
    const id = nanoid();
    definitions.unshift({ ...data, id });
    this.notify();

    return { ...data, id };
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
    }

    this.notify();

    return data;
  }

  async deleteTermDefinition(id: string): Promise<boolean> {
    await this.delay();
    if (!this.definitions) return false;

    const dataCatalog = this.definitions;
    const initialLength = dataCatalog.length;

    this.definitions = dataCatalog.filter((term) => term.id !== id);
    this.notify();

    return dataCatalog.length < initialLength;
  }

  listen(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  // Notify all subscribers
  private notify() {
    this.subscribers.forEach((callback) => callback());
  }
}

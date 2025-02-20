export interface DataCatalogTermDefinition {
  id?: string;
  name: string;
  definition?: string;
  otherNames?: string;
}

export interface DataCatalogColumnInput {
  definition: string;
  samples: string[];
  hide: boolean;
}

export interface DataCatalogColumn extends DataCatalogColumnInput {
  schemaName: string;
  tableName: string;
  columnName: string;
}

export interface DataCatalogTableRelationship {
  id: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  referenceTableName: string;
  referenceColumnName: string;
  hide: boolean;
}

export interface DataCatalogTable {
  schemaName: string;
  tableName: string;
  columns: DataCatalogColumn[];
  relations: DataCatalogTableRelationship[];
}

export type DataCatalogSchemas = Record<
  string,
  Record<string, DataCatalogTable>
>;

export default abstract class DataCatalogDriver {
  abstract load(): Promise<{
    definitions: DataCatalogTermDefinition[];
  }>;

  abstract updateColumn(
    schemaName: string,
    tableName: string,
    columnName: string,
    data: DataCatalogColumnInput
  ): Promise<DataCatalogColumn>;

  abstract updateTable(
    schemaName: string,
    tableName: string,
    data: DataCatalogColumn
  ): Promise<DataCatalogTable | undefined>;

  abstract getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): DataCatalogColumn | undefined;

  abstract getTable(
    schemaName: string,
    tableName: string
  ): DataCatalogTable | undefined;

  abstract deleteVirtualColumn(id: string): Promise<boolean>;

  abstract addVirtualJoin(
    data: Omit<DataCatalogTableRelationship, "id">
  ): Promise<DataCatalogTableRelationship>;

  abstract updateVirtualJoin(
    data: DataCatalogTableRelationship
  ): Promise<boolean>;

  abstract updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<DataCatalogTermDefinition | undefined>;

  abstract getTermDefinitions(): DataCatalogTermDefinition[];
  abstract deleteTermDefinition(id: string): Promise<boolean>;

  abstract listen(cb: () => void): () => void;
}

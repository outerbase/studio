import {
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogVirtualColumnInput,
} from "@/outerbase-cloud/api-type";

export interface DataCatalogTermDefinition {
  id?: string;
  name: string;
  definition?: string;
  otherNames?: string;
}
export interface DataCatalogModelTable {
  schemaName: string;
  tableName: string;

  virtualJoin: OuterbaseDataCatalogComment[];
  columns: Record<string, OuterbaseDataCatalogComment>;
  metadata?: OuterbaseDataCatalogComment;
}

export type DataCatalogSchemas = Record<
  string,
  Record<string, DataCatalogModelTable>
>;

export default abstract class DataCatalogDriver {
  abstract load(): Promise<{
    schemas: DataCatalogSchemas;
    definitions: OuterbaseDataCatalogDefinition[];
  }>;
  abstract updateColumn(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId?: string,
    isVirtual?: boolean
  ): Promise<OuterbaseDataCatalogComment>;

  abstract updateTable(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId?: string
  ): Promise<DataCatalogModelTable | undefined>;

  abstract getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): OuterbaseDataCatalogComment | undefined;

  abstract getTable(
    schemaName: string,
    tableName: string
  ): DataCatalogModelTable | undefined;

  abstract updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<DataCatalogTermDefinition | undefined>;

  abstract getTermDefinitions(): OuterbaseDataCatalogDefinition[];

  abstract deleteTermDefinition(id: string): Promise<boolean>;

  abstract deleteVirtualColumn(
    schemaName: string,
    tableName: string,
    id: string
  ): Promise<boolean>;

  abstract addEventListener(cb: () => void): void;
  abstract removeEventListener(cb: () => void): void;
}

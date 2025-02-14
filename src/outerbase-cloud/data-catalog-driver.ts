import DataCatalogDriver, {
  DataCatalogModelTable,
  DataCatalogSchemas,
  DataCatalogTermDefinition,
} from "@/extensions/data-catalog/driver";
import {
  createOuterbaseDataCatalogVirtualColumn,
  createOuterbaseDefinition,
  deleteOutebaseDataCatalogVirtualColumn,
  deleteOuterbaseDefinition,
  getOuterbaseBaseComments,
  getOuterbaseDefinitions,
  getOuterbaseSchemas,
  updateOuerbaseDefinition,
  updateOuterbaseDataCatalogVirtualColumn,
} from "./api-data-catalog";
import {
  OuterbaseDatabaseConfig,
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogVirtualColumnInput,
} from "./api-type";
import { transformOuterbaseSchema } from "./util";

export default class DataCatalogOuterbaseDriver implements DataCatalogDriver {
  private schemas: DataCatalogSchemas = {};
  private definitions: OuterbaseDataCatalogDefinition[] = [];
  protected config: OuterbaseDatabaseConfig;
  private subscribers: Set<() => void> = new Set();

  constructor(config: OuterbaseDatabaseConfig) {
    this.config = config;
  }

  async load(): Promise<{
    schemas: DataCatalogSchemas;
    definitions: OuterbaseDataCatalogDefinition[];
  }> {
    const { sourceId, workspaceId, baseId } = this.config;
    const [schemas, comments, definition] = await Promise.all([
      getOuterbaseSchemas(workspaceId, sourceId, baseId),
      getOuterbaseBaseComments(workspaceId, sourceId, baseId!),
      getOuterbaseDefinitions(workspaceId, baseId!),
    ]);
    const transformedSchemas = transformOuterbaseSchema(
      schemas,
      comments.items
    );
    this.schemas = transformedSchemas;
    this.definitions = definition.items;
    return {
      schemas: this.schemas,
      definitions: this.definitions,
    };
  }

  private async createUpdateColumn(
    data: OuterbaseDataCatalogVirtualColumnInput,
    id?: string
  ) {
    if (id) {
      return await updateOuterbaseDataCatalogVirtualColumn(
        this.config.workspaceId,
        this.config.sourceId,
        id,
        data
      );
    } else {
      return await createOuterbaseDataCatalogVirtualColumn(
        this.config.workspaceId,
        this.config.sourceId,
        data
      );
    }
  }

  async updateColumn(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId?: string,
    isVirtual?: boolean
  ): Promise<OuterbaseDataCatalogComment> {
    const result = await this.createUpdateColumn(data, commentId);

    if (result) {
      const normalizedSchemaName = schemaName.toLowerCase();
      const normalizedTableName = tableName.toLowerCase();

      if (
        this.schemas[normalizedSchemaName] &&
        this.schemas[normalizedSchemaName][normalizedTableName]
      ) {
        const table = this.schemas[normalizedSchemaName][normalizedTableName];

        if (isVirtual) {
          const index = table.virtualJoin.findIndex(
            (vc) => vc.id === commentId
          );
          if (index > -1) {
            table.virtualJoin[index] = {
              ...table.virtualJoin[index],
              ...result,
            };
          } else {
            table.virtualJoin?.push(result);
          }
        } else if (data.column) {
          table.columns[data.column] = {
            ...table.columns[data.column],
            ...result,
          };
        }
        // notify update driver
        this.notify();
      }
    }

    return result;
  }

  async deleteVirtualColumn(
    schemaName: string,
    tableName: string,
    id: string
  ): Promise<boolean> {
    const success = await deleteOutebaseDataCatalogVirtualColumn(
      this.config.workspaceId,
      this.config.sourceId,
      id
    );
    if (success) {
      const normalizedSchemaName = schemaName.toLowerCase();
      const normalizedTableName = tableName.toLowerCase();

      if (
        this.schemas[normalizedSchemaName] &&
        this.schemas[normalizedSchemaName][normalizedTableName]
      ) {
        const table = this.schemas[normalizedSchemaName][normalizedTableName];
        table.virtualJoin =
          table.virtualJoin?.filter((vc) => vc.id !== id) || [];
        // notify update driver
        this.notify();
      }
    }

    return success;
  }

  async updateTable(
    schemaName: string,
    tableName: string,
    data: OuterbaseDataCatalogVirtualColumnInput,
    commentId: string
  ): Promise<DataCatalogModelTable | undefined> {
    const result = await this.createUpdateColumn(data, commentId);

    if (result) {
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
        metadata: result,
      };

      this.notify();
      return schemas[normalizedTableName];
    }
  }

  async updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<OuterbaseDataCatalogDefinition | undefined> {
    if (!data) return;
    let result;
    const inputData = {
      name: data.name,
      otherNames: data.otherNames,
      definition: data.definition!,
    };
    if (data.id) {
      result = await updateOuerbaseDefinition(
        this.config.workspaceId,
        this.config.baseId!,
        data.id,
        inputData
      );
    } else {
      result = await createOuterbaseDefinition(
        this.config.workspaceId,
        this.config.baseId!,
        inputData
      );
    }

    if (result) {
      const updatedDefinitions = this.definitions;
      const index = updatedDefinitions.findIndex((def) => def.id === data.id);
      if (index > -1) {
        updatedDefinitions[index] = {
          ...updatedDefinitions[index],
          ...data,
        };
        this.definitions = updatedDefinitions;
      } else {
        this.definitions.unshift(result);
      }
      //notify update driver
      this.notify();
    }
    return result;
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

  async deleteTermDefinition(id: string): Promise<boolean> {
    try {
      await deleteOuterbaseDefinition(
        this.config.workspaceId,
        this.config.baseId!,
        id
      );
      const newDefinitions = this.definitions.filter((def) => def.id !== id);
      this.definitions = newDefinitions;
      //notify update driver
      this.notify();
      return true;
    } catch {
      return false;
    }
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

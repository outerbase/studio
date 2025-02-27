import DataCatalogDriver, {
  DataCatalogColumn,
  DataCatalogColumnInput,
  DataCatalogTable,
  DataCatalogTableMetadata,
  DataCatalogTableRelationship,
  DataCatalogTermDefinition,
} from "@/extensions/data-catalog/driver";
import {
  createOuterbaseDataCatalogVirtualColumn,
  createOuterbaseDefinition,
  deleteOutebaseDataCatalogVirtualColumn,
  deleteOuterbaseDefinition,
  getOuterbaseBaseComments,
  getOuterbaseDefinitions,
  updateOuerbaseDefinition,
  updateOuterbaseDataCatalogVirtualColumn,
} from "./api-data-catalog";
import {
  OuterbaseDatabaseConfig,
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogVirtualColumnInput,
} from "./api-type";

export default class DataCatalogOuterbaseDriver implements DataCatalogDriver {
  private definitions: OuterbaseDataCatalogDefinition[] = [];
  protected comments: OuterbaseDataCatalogComment[] = [];
  protected config: OuterbaseDatabaseConfig;
  private subscribers: Set<() => void> = new Set();

  constructor(config: OuterbaseDatabaseConfig) {
    this.config = config;
  }

  async load(): Promise<{
    definitions: OuterbaseDataCatalogDefinition[];
  }> {
    const { sourceId, workspaceId, baseId } = this.config;
    const [comments, definition] = await Promise.all([
      getOuterbaseBaseComments(workspaceId, sourceId, baseId!),
      getOuterbaseDefinitions(workspaceId, baseId!),
    ]);

    this.definitions = definition.items;
    this.comments = comments.items;

    return {
      definitions: this.definitions,
    };
  }

  private async createUpdateColumn(
    id: string | undefined,
    data: OuterbaseDataCatalogVirtualColumnInput
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

  private getCommentById(id: string): OuterbaseDataCatalogComment | undefined {
    return this.comments.find((c) => c.id === id);
  }

  private getComment(
    schemaName: string,
    tableName: string,
    columnName: string,
    isVirtualKey: boolean
  ): OuterbaseDataCatalogComment | undefined {
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();
    const normalizedColumnName = columnName.toLowerCase();
    if (this.comments.length === 0) return;
    const comment = this.comments.find(
      (c) =>
        c.schema?.toLowerCase() === normalizedSchemaName &&
        c.table?.toLowerCase() === normalizedTableName &&
        c.column?.toLowerCase() === normalizedColumnName &&
        c.flags.isVirtualKey === isVirtualKey
    );

    return comment;
  }

  async updateColumn(
    schemaName: string,
    tableName: string,
    columnName: string,
    data: DataCatalogColumnInput
  ): Promise<DataCatalogColumn> {
    // Check if it exists in the outerbase comment
    const comment = this.getComment(schemaName, tableName, columnName, false);
    const inputData: OuterbaseDataCatalogVirtualColumnInput = {
      body: data.definition,
      column: columnName,
      schema: schemaName,
      table: tableName,
      sample_data: data.samples.join(","),
      flags: {
        isActive: data.hide,
        isVirtualKey: false,
      },
      virtual_key_column: "",
      virtual_key_schema: "",
      virtual_key_table: "",
    };

    const result = await this.createUpdateColumn(comment?.id, inputData);
    if (result) {
      const updatedComments = this.comments;
      const index = updatedComments.findIndex((c) => c.id === comment?.id);
      if (index > -1) {
        updatedComments[index] = {
          ...updatedComments[index],
          ...result,
        };

        this.comments = updatedComments;
      } else {
        this.comments.unshift(result);
      }
    }

    //notify update driver

    this.notify();

    return {
      ...data,
      columnName,
      tableName,
      schemaName,
    };
  }

  async addVirtualJoin(
    data: Omit<DataCatalogTableRelationship, "id">
  ): Promise<DataCatalogTableRelationship> {
    const inputData: OuterbaseDataCatalogVirtualColumnInput = {
      body: "",
      column: data.columnName,
      schema: data.schemaName,
      table: data.tableName,
      sample_data: "",
      flags: {
        isActive: true,
        isVirtualKey: true,
      },
      virtual_key_column: data.referenceColumnName,
      virtual_key_schema: data.schemaName,
      virtual_key_table: data.referenceTableName,
    };
    const result = await this.createUpdateColumn(undefined, inputData);
    if (result) {
      this.comments.unshift(result);
      //notify update driver
      this.notify();
    }
    return {
      id: result.id,
      schemaName: result.schema,
      tableName: result.table,
      columnName: result.column,
      referenceTableName: result.virtualKeyTable,
      referenceColumnName: result.virtualKeyColumn,
      hide: result.flags.isActive,
    };
  }

  async deleteVirtualColumn(id: string): Promise<boolean> {
    const success = await deleteOutebaseDataCatalogVirtualColumn(
      this.config.workspaceId,
      this.config.sourceId,
      id
    );

    if (success) {
      const updatedComments = this.comments.filter((c) => c.id !== id);
      this.comments = updatedComments;
      //notify update driver
      this.notify();
    }

    return success;
  }

  async updateVirtualJoin(
    data: DataCatalogTableRelationship
  ): Promise<boolean> {
    const comment = this.getCommentById(data.id);
    if (!comment) return false;

    const inputData: OuterbaseDataCatalogVirtualColumnInput = {
      body: comment.body,
      column: data.columnName,
      schema: data.schemaName,
      table: data.tableName,
      sample_data: comment.sample_data,
      flags: {
        isActive: data.hide,
        isVirtualKey: true,
      },
      virtual_key_column: data.referenceColumnName,
      virtual_key_schema: data.schemaName,
      virtual_key_table: data.referenceTableName,
    };

    const result = await this.createUpdateColumn(comment.id, inputData);
    if (result) {
      const updatedComments = this.comments;
      const index = updatedComments.findIndex((c) => c.id === comment.id);
      if (index > -1) {
        updatedComments[index] = {
          ...updatedComments[index],
          ...result,
        };
        this.comments = updatedComments;
      } else {
        this.comments.unshift(result);
      }
      //notify update driver
      this.notify();
      return true;
    }

    return false;
  }

  async updateTable(
    schemaName: string,
    tableName: string,
    data: DataCatalogTableMetadata
  ): Promise<DataCatalogTable | undefined> {
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();
    const comment = this.comments.find(
      (c) =>
        c.schema?.toLowerCase() === normalizedSchemaName &&
        c.table?.toLowerCase() === normalizedTableName &&
        !c.flags.isVirtualKey &&
        !!c.alias
    );

    const inputData: OuterbaseDataCatalogVirtualColumnInput = {
      alias: data.alias,
      body: data.definition,
      schema: schemaName,
      table: tableName,
      sample_data: data.samples.join(","),
      flags: {
        isActive: data.hide,
        isVirtualKey: false,
      },
      virtual_key_column: "",
      virtual_key_table: "",
      virtual_key_schema: "",
    };
    const result = await this.createUpdateColumn(comment?.id, inputData);

    if (result) {
      const updatedComments = this.comments;
      const index = updatedComments.findIndex((c) => c.id === comment?.id);
      if (index > -1) {
        updatedComments[index] = {
          ...updatedComments[index],
          ...result,
        };
        this.comments = updatedComments;
      } else {
        this.comments.unshift(result);
      }
    }
    const table = this.getTable(schemaName, tableName);

    this.notify();
    //notify update driver

    return table;
  }

  getColumn(
    schemaName: string,
    tableName: string,
    columnName: string
  ): DataCatalogColumn | undefined {
    const comment = this.getComment(schemaName, tableName, columnName, false);
    if (!comment) return;
    return {
      schemaName: comment.schema,
      tableName: comment.table,
      columnName: comment.column,
      definition: comment.body,
      samples:
        comment.sample_data && comment.sample_data.trim()
          ? comment.sample_data.split(",")
          : [],
      hide: comment.flags.isActive,
    };
  }

  getTable(
    schemaName: string,
    tableName: string
  ): DataCatalogTable | undefined {
    const normalizedSchemaName = schemaName.toLowerCase();
    const normalizedTableName = tableName.toLowerCase();
    const columns = this.comments.filter(
      (c) =>
        c.schema?.toLowerCase() === normalizedSchemaName &&
        c.table?.toLowerCase() === normalizedTableName &&
        !c.flags.isVirtualKey
    );

    const relations = this.comments.filter(
      (c) =>
        c.schema?.toLowerCase() === normalizedSchemaName &&
        c.table?.toLowerCase() === normalizedTableName &&
        c.flags?.isVirtualKey
    );

    const metadata = this.comments.find(
      (c) =>
        c.schema?.toLowerCase() === normalizedSchemaName &&
        c.table?.toLowerCase() === normalizedTableName &&
        !c.flags.isVirtualKey &&
        !!c.alias
    );

    const table: DataCatalogTable = {
      schemaName,
      tableName,
      columns: columns.map((c) => ({
        schemaName: c.schema,
        tableName: c.table,
        columnName: c.column,
        definition: c.body,
        samples: c.sample_data.split(","),
        hide: c.flags.isActive,
      })),
      relations: relations.map((c) => ({
        id: c.id,
        schemaName: c.schema,
        tableName: c.table,
        columnName: c.column,
        referenceTableName: c.virtualKeyTable,
        referenceColumnName: c.virtualKeyColumn,
        hide: c.flags.isActive,
      })),
      metadata: metadata
        ? {
            tableName: metadata.table,
            alias: metadata.alias || "",
            definition: metadata.body,
            columnName: metadata.column,
            schemaName: metadata.schema,
            samples: [],
            hide: false,
          }
        : undefined,
    };

    return table;
  }

  getTermDefinitions(): OuterbaseDataCatalogDefinition[] {
    if (!this.definitions) {
      return [];
    }
    return this.definitions;
  }

  async addTermDefinition(
    data: Omit<DataCatalogTermDefinition, "id">
  ): Promise<DataCatalogTermDefinition | undefined> {
    if (!data) return;
    const inputData = {
      name: data.name,
      otherNames: data.otherNames,
      definition: data.definition!,
    };

    const result = await createOuterbaseDefinition(
      this.config.workspaceId,
      this.config.baseId!,
      inputData
    );

    if (result) {
      this.definitions.unshift(result);
      //notify update driver
      this.notify();
    }
    return result;
  }
  async updateTermDefinition(
    data: DataCatalogTermDefinition
  ): Promise<OuterbaseDataCatalogDefinition | undefined> {
    if (!data) return;
    const inputData = {
      name: data.name,
      otherNames: data.otherNames,
      definition: data.definition!,
    };

    const result = await updateOuerbaseDefinition(
      this.config.workspaceId,
      this.config.baseId!,
      data.id,
      inputData
    );
    if (result) {
      const updatedDefinitions = this.definitions;
      const index = updatedDefinitions.findIndex((def) => def.id === data.id);
      updatedDefinitions[index] = {
        ...updatedDefinitions[index],
        ...result,
      };
      this.definitions = updatedDefinitions;

      //notify update driver
      this.notify();
    }
    return result;
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

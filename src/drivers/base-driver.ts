import { type ColumnHeader, ColumnType } from "@outerbase/sdk-transform";

export type InValue =
  | null
  | string
  | number
  | bigint
  | ArrayBuffer
  | boolean
  | Uint8Array
  | Date;

export function describeTableColumnType(type: ColumnType) {
  switch (type) {
    case ColumnType.TEXT:
      return "TEXT";

    case ColumnType.INTEGER:
      return "INTEGER";

    case ColumnType.REAL:
      return "REAL";

    case ColumnType.BLOB:
      return "BLOB";
  }
}

export type SupportedDialect = "sqlite" | "mysql" | "postgres" | "dolt";
export type SqlOrder = "ASC" | "DESC";
export type DatabaseRow = Record<string, unknown>;

export type DatabaseHeader = ColumnHeader;

export interface DatabaseResultStat {
  rowsAffected: number;
  rowsRead: number | null;
  rowsWritten: number | null;
  queryDurationMs: number | null;
}

export interface DatabaseResultSet {
  rows: DatabaseRow[];
  headers: DatabaseHeader[];
  stat: DatabaseResultStat;
  lastInsertRowid?: number;
}

export interface ColumnSortOption {
  columnName: string;
  by: SqlOrder;
}

export interface SelectFromTableOptions {
  whereRaw?: string;
  limit: number;
  offset: number;
  orderBy?: ColumnSortOption[];
}

export type DatabaseValue<T = unknown> = T | undefined | null;

export type DatabaseSchemas = Record<string, DatabaseSchemaItem[]>;

export interface DatabaseSchemaItem {
  type: "table" | "trigger" | "view" | "schema";
  name: string;
  schemaName: string;
  tableName?: string;
  tableSchema?: DatabaseTableSchema;
}

export interface DatabaseTableColumn {
  name: string;
  type: string;
  pk?: boolean;
  constraint?: DatabaseTableColumnConstraint;
}

export type DatabaseColumnConflict =
  | "ROLLBACK"
  | "ABORT"
  | "FAIL"
  | "IGNORE"
  | "REPLACE";

export type DatabaseForeignKeyAction =
  | "SET_NULL"
  | "SET_DEFAULT"
  | "CASCADE"
  | "RESTRICT"
  | "NO_ACTION";

export interface DatabaseForeignKeyClause {
  foreignSchemaName?: string;
  foreignTableName?: string;
  foreignColumns?: string[];
  columns?: string[];
  onUpdate?: DatabaseForeignKeyAction;
  onDelete?: DatabaseForeignKeyAction;
}

export interface DatabaseTableColumnConstraint {
  name?: string;

  primaryKey?: boolean;
  primaryColumns?: string[];
  primaryKeyOrder?: SqlOrder;
  primaryKeyConflict?: DatabaseColumnConflict;
  autoIncrement?: boolean;

  notNull?: boolean;
  notNullConflict?: DatabaseColumnConflict;

  unique?: boolean;
  uniqueColumns?: string[];
  uniqueConflict?: DatabaseColumnConflict;

  checkExpression?: string;

  defaultValue?: unknown;
  defaultExpression?: string;

  collate?: string;

  generatedExpression?: string;
  generatedType?: "STORED" | "VIRTUAL";

  foreignKey?: DatabaseForeignKeyClause;
}

export interface DatabaseTableFts5 {
  content?: string;
  contentRowId?: string;
}

export interface DatabaseTableSchemaStats {
  sizeInByte?: number;
  estimateRowCount?: number;
}
export interface DatabaseTableSchema {
  columns: DatabaseTableColumn[];
  pk: string[];
  autoIncrement: boolean;
  schemaName: string;
  tableName?: string;
  constraints?: DatabaseTableColumnConstraint[];
  createScript?: string;
  fts5?: DatabaseTableFts5;
  type?: "table" | "view";
  withoutRowId?: boolean;
  strict?: boolean;
  stats?: DatabaseTableSchemaStats;
}

export type TriggerWhen = "BEFORE" | "AFTER" | "INSTEAD_OF";

export type TriggerOperation = "INSERT" | "UPDATE" | "DELETE";

export interface DatabaseTriggerSchema {
  name: string;
  operation: TriggerOperation;
  when: TriggerWhen;
  schemaName: string;
  tableName: string;
  columnNames?: string[];
  whenExpression: string;
  statement: string;
}

export interface DatabaseViewSchema {
  name: string;
  schemaName: string;
  statement: string;
}

interface DatabaseTableOperationInsert {
  operation: "INSERT";
  values: Record<string, DatabaseValue>;
  autoIncrementPkColumn?: string;
  pk?: string[];
}

interface DatabaseTableOperationUpdate {
  operation: "UPDATE" | "DELETE";
  values: Record<string, DatabaseValue>;
  where: Record<string, DatabaseValue>;
}

interface DatabaseTableOperationDelete {
  operation: "DELETE";
  where: Record<string, DatabaseValue>;
}

export type DatabaseTableOperation =
  | DatabaseTableOperationInsert
  | DatabaseTableOperationUpdate
  | DatabaseTableOperationDelete;

export interface DatabaseTableOperationReslt {
  lastId?: number;
  record?: Record<string, DatabaseValue>;
}

export interface ColumnTypeSuggestionGroup {
  name: string;
  suggestions: ColumnTypeSuggestion[];
}
export interface ColumnTypeSuggestion {
  name: string;
  parameters?: {
    name: string;
    description?: string;
    default: string;
  }[];
  description?: string | ((type: string, parameters?: string[]) => string);
}
export interface ColumnTypeSelector {
  type: "dropdown" | "text";
  dropdownOptions?: { value: string; text: string }[];
  dropdownNormalized?: (value: string) => string;
  typeSuggestions?: ColumnTypeSuggestionGroup[];

  // This will use for auto field when create table column
  idTypeName?: string;
  textTypeName?: string;
}

export interface DriverFlags {
  defaultSchema: string;
  optionalSchema: boolean;
  supportBigInt: boolean;
  supportCreateUpdateTable: boolean;
  supportModifyColumn: boolean;
  dialect: SupportedDialect;

  supportUseStatement?: boolean;

  // If database supports this, we don't need
  // to make a separate request to get updated
  // data when update
  supportInsertReturning: boolean;
  supportUpdateReturning: boolean;
  supportRowId: boolean;
  supportCreateUpdateDatabase: boolean;
  supportCreateUpdateTrigger: boolean;
}

export interface DatabaseTableColumnChange {
  key: string;
  old: DatabaseTableColumn | null;
  new: DatabaseTableColumn | null;
}

export interface DatabaseTableConstraintChange {
  id: string;
  old: DatabaseTableColumnConstraint | null;
  new: DatabaseTableColumnConstraint | null;
}

export interface DatabaseTableSchemaChange {
  schemaName?: string;
  name: {
    old?: string;
    new?: string;
  };
  columns: DatabaseTableColumnChange[];
  constraints: DatabaseTableConstraintChange[];
  createScript?: string;
}

export interface DatabaseSchemaChange {
  name: {
    old?: string;
    new?: string;
  };
  createScript?: string;
  collate?: string;
}

export interface QueryableBaseDriver {
  query(stmt: string): Promise<DatabaseResultSet>;
  transaction(stmts: string[]): Promise<DatabaseResultSet[]>;

  // This is optional. We can always fallback to multiple query
  // This is just optimization for driver that support batch query
  batch?(stmts: string[]): Promise<DatabaseResultSet[]>;
}

export abstract class BaseDriver {
  // Flags
  abstract getFlags(): DriverFlags;
  abstract getCurrentSchema(): Promise<string | null>;
  abstract columnTypeSelector: ColumnTypeSelector;
  abstract getCollationList(): string[];

  // Helper class
  abstract escapeId(id: string): string;
  abstract escapeValue(value: unknown): string;

  // Methods
  abstract close(): void;

  abstract query(stmt: string): Promise<DatabaseResultSet>;
  abstract batch(stmts: string[]): Promise<DatabaseResultSet[]>;
  abstract transaction(stmts: string[]): Promise<DatabaseResultSet[]>;

  abstract schemas(): Promise<DatabaseSchemas>;
  abstract tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema>;

  abstract inferTypeFromHeader(
    header?: DatabaseTableColumn
  ): ColumnType | undefined;

  abstract trigger(
    schemaName: string,
    name: string
  ): Promise<DatabaseTriggerSchema>;

  abstract findFirst(
    schemaName: string,
    tableName: string,
    key: Record<string, DatabaseValue>
  ): Promise<DatabaseResultSet>;

  abstract selectTable(
    schemaName: string,
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }>;

  abstract updateTableData(
    schemaName: string,
    tableName: string,
    ops: DatabaseTableOperation[],

    // Using table scheam to determine and throw error
    // if the operation is unsafe
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]>;

  abstract dropTable(schemaName: string, tableName: string): Promise<void>;
  abstract emptyTable(schemaName: string, tableName: string): Promise<void>;

  abstract createUpdateTableSchema(change: DatabaseTableSchemaChange): string[];
  abstract createUpdateDatabaseSchema(change: DatabaseSchemaChange): string[];

  abstract createTrigger(trigger: DatabaseTriggerSchema): string;
  abstract dropTrigger(schemaName: string, name: string): string;
  abstract createView(view: DatabaseViewSchema): string;
  abstract dropView(schemaName: string, name: string): string;

  abstract view(schemaName: string, name: string): Promise<DatabaseViewSchema>;
}

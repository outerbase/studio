export type InValue =
  | null
  | string
  | number
  | bigint
  | ArrayBuffer
  | boolean
  | Uint8Array
  | Date;

export enum TableColumnDataType {
  TEXT = 1,
  INTEGER = 2,
  REAL = 3,
  BLOB = 4,
}

export function describeTableColumnType(type: TableColumnDataType) {
  switch (type) {
    case TableColumnDataType.TEXT:
      return "TEXT";

    case TableColumnDataType.INTEGER:
      return "INTEGER";

    case TableColumnDataType.REAL:
      return "REAL";

    case TableColumnDataType.BLOB:
      return "BLOB";
  }
}

export type SupportedDialect = "sqlite" | "mysql" | "postgres";
export type SqlOrder = "ASC" | "DESC";
export type DatabaseRow = Record<string, unknown>;

export interface DatabaseHeader {
  name: string;
  displayName: string;
  originalType: string | null;
  type: TableColumnDataType | undefined;
}

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
}

export type TriggerWhen = "BEFORE" | "AFTER" | "INSTEAD_OF";

export type TriggerOperation = "INSERT" | "UPDATE" | "DELETE";

export interface DatabaseTriggerSchema {
  name: string;
  operation: TriggerOperation;
  when: TriggerWhen;
  tableName: string;
  columnNames?: string[];
  whenExpression: string;
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
  typeSuggestions?: ColumnTypeSuggestionGroup[];
}

export interface DriverFlags {
  defaultSchema: string;
  optionalSchema: boolean;
  supportBigInt: boolean;
  supportCreateUpdateTable: boolean;
  supportModifyColumn: boolean;
  mismatchDetection: boolean;
  dialect: SupportedDialect;

  supportUseStatement?: boolean;

  // If database supports this, we don't need
  // to make a separate request to get updated
  // data when update
  supportInsertReturning: boolean;
  supportUpdateReturning: boolean;
  supportRowId: boolean;
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

export abstract class BaseDriver {
  // Flags
  abstract getFlags(): DriverFlags;
  abstract getCurrentSchema(): Promise<string | null>;
  abstract columnTypeSelector: ColumnTypeSelector;

  // Helper class
  abstract escapeId(id: string): string;
  abstract escapeValue(value: unknown): string;

  // Methods
  abstract close(): void;

  abstract query(stmt: string): Promise<DatabaseResultSet>;
  abstract transaction(stmts: string[]): Promise<DatabaseResultSet[]>;

  abstract schemas(): Promise<DatabaseSchemas>;
  abstract tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema>;

  abstract inferTypeFromHeader(
    header?: DatabaseTableColumn
  ): TableColumnDataType | undefined;

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
}

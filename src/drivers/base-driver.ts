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

export type SqlOrder = "ASC" | "DESC";
export type DatabaseRow = Record<string, unknown>;

export interface DatabaseHeader {
  name: string;
  displayName: string;
  originalType: string | null;
  type: TableColumnDataType;
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

export interface DatabaseSchemaItem {
  type: "table" | "trigger" | "view";
  name: string;
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
  tableName?: string;
  constraints?: DatabaseTableColumnConstraint[];
  createScript?: string;
  fts5?: DatabaseTableFts5;
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

export abstract class BaseDriver {
  // Flags
  abstract supportBigInt(): boolean;

  // Methods
  abstract close(): void;

  abstract query(stmt: string): Promise<DatabaseResultSet>;
  abstract transaction(stmts: string[]): Promise<DatabaseResultSet[]>;

  abstract schemas(): Promise<DatabaseSchemaItem[]>;
  abstract tableSchema(tableName: string): Promise<DatabaseTableSchema>;
  abstract trigger(name: string): Promise<DatabaseTriggerSchema>;

  abstract selectTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }>;

  abstract updateTableData(
    tableName: string,
    ops: DatabaseTableOperation[],

    // Using table scheam to determine and throw error
    // if the operation is unsafe
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]>;
}

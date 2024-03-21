import { InStatement, ResultSet } from "@libsql/client/web";

export interface SelectFromTableOptions {
  whereRaw?: string;
  limit: number;
  offset: number;
}

export type DatabaseValue<T = unknown> = T | undefined | null;

export interface DatabaseSchemaItem {
  name: string;
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
  primaryKeyOrder?: "ASC" | "DESC";
  primaryKeyConflict?: DatabaseColumnConflict;
  autoIncrement?: boolean;

  notNull?: boolean;
  notNullConflict?: DatabaseColumnConflict;

  unique?: boolean;
  uniqueConflict?: DatabaseColumnConflict;

  checkExpression?: string;

  defaultValue?: unknown;
  defaultExpression?: string;

  collate?: string;

  generatedExpression?: string;
  generatedType?: "STORED" | "VIRTUAL";

  foreignKey?: DatabaseForeignKeyClause;
}

export interface DatabaseTableSchema {
  columns: DatabaseTableColumn[];
  pk: string[];
  autoIncrement: boolean;
  tableName?: string;
  constraints?: DatabaseTableColumnConstraint[];
  createScript?: string;
}

interface DatabaseTableOperationInsert {
  operation: "INSERT";
  values: Record<string, DatabaseValue>;
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
  lastId?: bigint;
  record?: Record<string, DatabaseValue>;
}

export abstract class BaseDriver {
  abstract getEndpoint(): string;
  abstract close(): void;

  abstract query(stmt: InStatement): Promise<ResultSet>;
  abstract transaction(stmts: InStatement[]): Promise<ResultSet[]>;

  abstract schemas(): Promise<DatabaseSchemaItem[]>;
  abstract tableSchema(tableName: string): Promise<DatabaseTableSchema>;

  abstract selectTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: ResultSet; schema: DatabaseTableSchema }>;

  abstract updateTableData(
    tableName: string,
    ops: DatabaseTableOperation[],

    // Using table scheam to determine and throw error
    // if the operation is unsafe
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]>;
}

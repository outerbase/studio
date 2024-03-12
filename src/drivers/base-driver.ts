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

export abstract class BaseDriver {
  abstract getEndpoint(): string;
  abstract close(): void;

  abstract query(stmt: InStatement): Promise<ResultSet>;
  abstract transaction(stmts: InStatement[]): Promise<ResultSet[]>;

  abstract getTableList(): Promise<DatabaseSchemaItem[]>;
  abstract getTableSchema(tableName: string): Promise<DatabaseTableSchema>;

  abstract selectFromTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<ResultSet>;
}

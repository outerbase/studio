import { ColumnType } from "@outerbase/sdk-transform";
import {
  ColumnTypeSelector,
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableSchema,
  DatabaseTableSchemaChange,
  DatabaseTriggerSchema,
  DatabaseViewSchema,
  DriverFlags,
  QueryableBaseDriver,
} from "../base-driver";
import CommonSQLImplement from "../common-sql-imp";
import { escapeSqlValue } from "../sqlite/sql-helper";
import { generatePostgresSchemaChange } from "./generate-schema";
import { POSTGRES_DATA_TYPE_SUGGESTION } from "./postgres-data-type";

interface PostgresSchemaRow {
  catalog_name: string;
  schema_name: string;
}

interface PostgresTableRow {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  table_type: string;
  table_size: number;
}

interface PostgresColumnRow {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
  column_default: string | null;
  is_nullable: "YES" | "NO";
  data_type: string;
  character_maximum_length: number;
  numeric_precision: number;
  numeric_scale: number;
  datetime_precision: number;
  character_set_name: string;
  collation_name: string;
  is_generated: "NEVER" | "ALWAYS";
  generation_expression: string;
}

interface PostgresConstraintRow {
  constraint_name: string;
  table_schema: string;
  table_name: string;
  constraint_type: string;
  column_name: string;
  reference_table_schema: string;
  reference_table_name: string;
  reference_column_name: string;
}

export default class PostgresLikeDriver extends CommonSQLImplement {
  constructor(protected _db: QueryableBaseDriver) {
    super();
  }

  query(stmt: string): Promise<DatabaseResultSet> {
    return this._db.query(stmt);
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return this._db.transaction(stmts);
  }

  batch(stmts: string[]): Promise<DatabaseResultSet[]> {
    return this._db.batch ? this._db.batch(stmts) : super.batch(stmts);
  }

  close(): void {
    // Do nothing
  }

  columnTypeSelector: ColumnTypeSelector = POSTGRES_DATA_TYPE_SUGGESTION;

  escapeId(id: string) {
    return `"${id.replace(/"/g, '""')}"`;
  }

  escapeValue(value: unknown): string {
    return escapeSqlValue(value);
  }

  getFlags(): DriverFlags {
    return {
      defaultSchema: "public",
      dialect: "postgres",
      optionalSchema: false,
      supportRowId: false,
      supportBigInt: false,
      supportModifyColumn: true,
      supportCreateUpdateTable: true,
      supportCreateUpdateDatabase: false,
      supportInsertReturning: true,
      supportUpdateReturning: true,
      supportCreateUpdateTrigger: false,
      supportUseStatement: true,
    };
  }

  async getCurrentSchema(): Promise<string | null> {
    const result = (await this.query("SHOW search_path")) as unknown as {
      rows: { search_path?: string | null }[];
    };

    const db = result.rows[0].search_path!.split(",")[0];

    return db === this.escapeId("$user") ? "public" : db;
  }

  async schemas(): Promise<DatabaseSchemas> {
    const schemaSql = `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')`;
    const tableSql =
      "SELECT *, pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) AS table_size FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast');";
    const columnSql =
      "SELECT * FROM information_schema.columns WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')";
    const constraintSql = `SELECT
	tc.constraint_name,
	tc.table_schema,
	tc.table_name,
	tc.constraint_type,
	kcu.column_name,
	ccu.table_schema AS reference_table_schema,
	ccu.table_name AS reference_table_name,
	ccu.column_name AS reference_column_name
FROM
	information_schema.table_constraints AS tc
	LEFT JOIN information_schema.key_column_usage AS kcu
	ON (
		tc.table_schema = kcu.table_schema AND
		tc.table_name = kcu.table_name AND
		tc.constraint_name = kcu.constraint_name
	)
	LEFT JOIN information_schema.constraint_column_usage AS ccu
	ON (
		ccu.table_schema = kcu.table_schema AND
		ccu.constraint_name = kcu.constraint_name
	)
WHERE
	tc.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')`;

    const result = await this.batch([
      schemaSql,
      tableSql,
      columnSql,
      constraintSql,
    ]);

    const schemaResult = result[0].rows as unknown as PostgresSchemaRow[];
    const tableResult = result[1].rows as unknown as PostgresTableRow[];
    const columnsResult = result[2].rows as unknown as PostgresColumnRow[];
    const constraintResult = result[3]
      .rows as unknown as PostgresConstraintRow[];

    const schemas: DatabaseSchemas = {};

    for (const schema of schemaResult) {
      schemas[schema.schema_name] = [];
    }

    const tableRecord: Record<string, DatabaseSchemaItem> = {};
    for (const table of tableResult) {
      const key = table.table_schema + "." + table.table_name;

      const tableItem: DatabaseSchemaItem = {
        name: table.table_name,
        schemaName: table.table_schema,
        type: table.table_type === "BASE TABLE" ? "table" : "view",
        tableName: table.table_name,
        tableSchema: {
          stats: {
            sizeInByte: table.table_size,
          },
          columns: [],
          constraints: [],
          pk: [],
          autoIncrement: false,
          schemaName: table.table_schema,
          tableName: table.table_name,
        },
      };

      tableRecord[key] = tableItem;

      if (schemas[table.table_schema]) {
        schemas[table.table_schema].push(tableItem);
      }
    }

    // Add columns to table schema
    const columnRecord: Record<string, DatabaseTableColumn> = {};
    for (const column of columnsResult) {
      const key =
        column.table_schema +
        "." +
        column.table_name +
        "." +
        column.column_name;

      const columnItem: DatabaseTableColumn = {
        name: column.column_name,
        type: column.data_type,
        constraint: {
          notNull: column.is_nullable === "NO",
          defaultValue: column.column_default,
          generatedExpression: column.generation_expression,
        },
      };

      columnRecord[key] = columnItem;

      const tableKey = column.table_schema + "." + column.table_name;

      const tableSchema = tableRecord[tableKey]?.tableSchema;
      if (tableSchema) {
        tableSchema.columns.push(columnItem);
      }
    }

    // Add constraints to table schema
    const constraintRecord: Record<string, DatabaseTableColumnConstraint> = {};

    for (const constraint of constraintResult) {
      const tableKey = constraint.table_schema + "." + constraint.table_name;
      const constraintKey = tableKey + "." + constraint.column_name;

      const constraintItem = constraintRecord[constraintKey] || {
        name: constraint.constraint_name,
        primaryKey: false,
        notNull: false,
        unique: false,
        checkExpression: "",
        defaultValue: null,
      };

      if (constraint.constraint_type === "PRIMARY KEY") {
        constraintItem.primaryKey = true;
        constraintItem.primaryColumns = [
          ...(constraintItem?.primaryColumns ?? []),
          constraint.column_name,
        ];
      } else if (constraint.constraint_type === "FOREIGN KEY") {
        constraintItem.foreignKey = {
          foreignSchemaName: constraint.reference_table_schema,
          foreignTableName: constraint.reference_table_name,
          foreignColumns: [
            ...(constraintItem?.foreignKey?.foreignColumns ?? []),
            constraint.reference_column_name,
          ],
          columns: [constraint.column_name],
        };
      }

      constraintRecord[constraintKey] = constraintItem;
      const tableSchema = tableRecord[tableKey]?.tableSchema;
      if (tableSchema) {
        tableSchema.constraints = [
          ...(tableRecord[tableKey].tableSchema?.constraints ?? []),
          constraintItem,
        ];
      }
    }

    // Building PK
    for (const tableKey in tableRecord) {
      const table = tableRecord[tableKey];
      if (table.tableSchema?.constraints) {
        const pk = table.tableSchema.constraints.find(
          (c) => c.primaryKey
        ) as DatabaseTableColumnConstraint;
        if (pk) {
          table.tableSchema.pk = pk.primaryColumns ?? [];
        }
      }
    }

    return schemas;
  }

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const columnsResult = (
      await this.query(
        `SELECT * FROM information_schema.columns WHERE  table_schema = ${this.escapeValue(schemaName)} AND table_name = ${this.escapeValue(tableName)}`
      )
    ).rows as unknown as PostgresColumnRow[];

    const constraintResult = (
      await this.query(`SELECT
	tc.constraint_name,
	tc.table_schema,
	tc.table_name,
	tc.constraint_type,
	kcu.column_name,
	ccu.table_schema AS reference_table_schema,
	ccu.table_name AS reference_table_name,
	ccu.column_name AS reference_column_name
FROM
	information_schema.table_constraints AS tc
	LEFT JOIN information_schema.key_column_usage AS kcu
	ON (
		tc.table_schema = kcu.table_schema AND
		tc.table_name = kcu.table_name AND
		tc.constraint_name = kcu.constraint_name
	)
	LEFT JOIN information_schema.constraint_column_usage AS ccu
	ON (
		ccu.table_schema = kcu.table_schema AND
		ccu.constraint_name = kcu.constraint_name
	)
WHERE
	tc.table_schema = ${this.escapeValue(schemaName)} AND tc.table_name = ${this.escapeValue(tableName)}`)
    ).rows as unknown as PostgresConstraintRow[];

    const constraintRecord: Record<string, DatabaseTableColumnConstraint> = {};
    for (const constraint of constraintResult.filter(
      (f) => f.column_name !== null
    )) {
      const key = constraint.constraint_name;
      const constraintItem = constraintRecord[key] || {
        name: constraint.constraint_name,
        primaryKey: false,
        notNull: false,
        unique: false,
        checkExpression: "",
        defaultValue: null,
      };

      if (constraint.constraint_type === "PRIMARY KEY") {
        constraintItem.primaryKey = true;
        constraintItem.primaryColumns = [
          ...(constraintItem?.primaryColumns ?? []),
          constraint.column_name,
        ];
      } else if (constraint.constraint_type === "FOREIGN KEY") {
        constraintItem.foreignKey = {
          foreignSchemaName: constraint.reference_table_schema,
          foreignTableName: constraint.reference_table_name,
          foreignColumns: [
            ...(constraintItem?.foreignKey?.foreignColumns ?? []),
            constraint.reference_column_name,
          ],
          columns: [constraint.column_name],
        };
      } else if (constraint.constraint_type === "UNIQUE") {
        constraintItem.unique = true;
        constraintItem.uniqueColumns = [constraint.column_name];
      }

      constraintRecord[key] = constraintItem;
    }

    const pkColumn =
      Object.values(constraintRecord).find((c) => c.primaryKey)
        ?.primaryColumns ?? [];

    const tableSchema: DatabaseTableSchema = {
      columns: columnsResult.map((column) => ({
        name: column.column_name,
        type: column.data_type,
        constraint: {
          notNull: column.is_nullable === "NO",
          defaultValue: column.column_default,
          generatedExpression: column.generation_expression,
          primaryKey: pkColumn.includes(column.column_name),
        },
      })),
      constraints: Object.values(constraintRecord),
      pk: pkColumn,
      autoIncrement: true,
      schemaName,
      tableName,
    };

    return tableSchema;
  }

  trigger(): Promise<DatabaseTriggerSchema> {
    throw new Error("Not implemented");
  }

  createUpdateTableSchema(change: DatabaseTableSchemaChange): string[] {
    return generatePostgresSchemaChange(this, change);
  }

  createUpdateDatabaseSchema(): string[] {
    throw new Error("Not implemented");
  }

  createTrigger(): string {
    throw new Error("Not implemented");
  }

  dropTrigger(): string {
    throw new Error("Not implemented");
  }

  async view(schemaName: string, name: string): Promise<DatabaseViewSchema> {
    const sql = `SELECT * FROM information_schema.views WHERE TABLE_SCHEMA=${this.escapeValue(schemaName)} AND TABLE_NAME=${this.escapeValue(name)}`;
    const result = await this.query(sql);

    const viewRow = result.rows[0] as { view_definition: string } | undefined;
    if (!viewRow) throw new Error("View dose not exist");

    const statement = viewRow.view_definition.trim();

    return {
      schemaName,
      name,
      statement,
    };
  }

  createView(view: DatabaseViewSchema): string {
    return `CREATE VIEW ${this.escapeId(view.schemaName)}.${this.escapeId(view.name)} AS ${view.statement}`;
  }

  dropView(schemaName: string, name: string): string {
    return `DROP VIEW IF EXISTS ${this.escapeId(schemaName)}.${this.escapeId(name)}`;
  }

  inferTypeFromHeader(): ColumnType | undefined {
    return undefined;
  }
}

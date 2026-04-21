import { ColumnType } from "@outerbase/sdk-transform";
import {
  ColumnTypeSelector,
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseSchemas,
  DatabaseTableColumn,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  DatabaseTableSchemaChange,
  DatabaseTriggerSchema,
  DatabaseViewSchema,
  DatabaseValue,
  DriverFlags,
  QueryableBaseDriver,
} from "../base-driver";
import CommonSQLImplement from "../common-sql-imp";
import { escapeSqlValue } from "../sqlite/sql-helper";
import { clickhouseTypeToColumnType } from "./clickhouse-http";
import { CLICKHOUSE_DATA_TYPE_SUGGESTION } from "./clickhouse-data-type";
import { generateClickHouseSchemaChange } from "./generate-schema";

interface ClickHouseDatabaseRow {
  name: string;
}

interface ClickHouseTableRow {
  database: string;
  name: string;
  engine: string;
  total_rows: string | number | null;
  total_bytes: string | number | null;
  is_temporary: number;
}

interface ClickHouseColumnRow {
  database: string;
  table: string;
  name: string;
  type: string;
  default_kind: string;
  default_expression: string;
  is_in_primary_key: number;
  comment: string;
  position: number;
}

const SYSTEM_DATABASES = ["system", "INFORMATION_SCHEMA", "information_schema"];

/**
 * Parse a `USE <db>` statement and return the target database name, or
 * `null` if the input isn't a USE statement. Handles backtick / double-quote
 * quoted identifiers and a trailing semicolon.
 */
function parseUseStatement(sql: string): string | null {
  const match =
    /^\s*USE\s+(?:`([^`]+)`|"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*;?\s*$/i.exec(
      sql
    );
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

function coerceNumeric(value: string | number | null): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * ClickHouse driver for Outerbase Studio.
 *
 * ClickHouse is a multi-database OLAP store with an SQL-compatible dialect
 * but some notable departures from OLTP engines: no general transactions,
 * asynchronous mutations for UPDATE/DELETE, no trigger support, and no
 * foreign-key constraints on MergeTree tables. Capability flags are set
 * accordingly so the Studio UI hides affordances that would never succeed.
 */
export default class ClickHouseLikeDriver extends CommonSQLImplement {
  columnTypeSelector: ColumnTypeSelector = CLICKHOUSE_DATA_TYPE_SUGGESTION;

  // When connecting through the Outerbase Cloud proxy we are often scoped
  // to a single database; match the MySQL driver's shape for this.
  selectedDatabase: string = "";

  constructor(
    protected _db: QueryableBaseDriver,
    selectedDatabase = ""
  ) {
    super();
    this.selectedDatabase = selectedDatabase;
  }

  /**
   * Intercept `USE <db>` statements. ClickHouse's HTTP interface is
   * stateless — it runs each query in its own session and forgets the
   * `USE`. We persist the selection by flipping the `?database=X` URL
   * param on the underlying HTTP queryable (when available), so that
   * subsequent unqualified queries like `SELECT * FROM events` resolve
   * against the selected database.
   */
  query(stmt: string): Promise<DatabaseResultSet> {
    const useTarget = parseUseStatement(stmt);
    if (useTarget !== null) {
      const queryable = this._db as {
        setDatabase?: (db: string) => void;
      };
      if (typeof queryable.setDatabase === "function") {
        queryable.setDatabase(useTarget);
        return Promise.resolve({
          headers: [],
          rows: [],
          stat: {
            rowsAffected: 0,
            rowsRead: null,
            rowsWritten: null,
            queryDurationMs: 0,
          },
        });
      }
    }
    return this._db.query(stmt);
  }

  transaction(stmts: string[]): Promise<DatabaseResultSet[]> {
    return this._db.transaction(stmts);
  }

  batch(stmts: string[]): Promise<DatabaseResultSet[]> {
    return this._db.batch ? this._db.batch(stmts) : super.batch(stmts);
  }

  close(): void {
    // Nothing to tear down — transport is HTTP/fetch-based.
  }

  escapeId(id: string): string {
    // ClickHouse accepts either backticks or double quotes. Use backticks so
    // reserved keywords like `date` / `user` keep working in raw SQL.
    return `\`${id.replace(/`/g, "``")}\``;
  }

  escapeValue(value: unknown): string {
    return escapeSqlValue(value);
  }

  getFlags(): DriverFlags {
    return {
      defaultSchema: this.selectedDatabase || "default",
      optionalSchema: this.selectedDatabase ? true : false,
      dialect: "clickhouse",
      supportBigInt: true,
      supportModifyColumn: true,
      supportCreateUpdateTable: true,
      supportCreateUpdateDatabase: this.selectedDatabase ? false : true,
      supportUseStatement: true,
      supportRowId: false,
      // ClickHouse INSERT / UPDATE statements do not return affected rows
      // inline; rely on a follow-up SELECT (the CommonSQLImplement default).
      supportInsertReturning: false,
      supportUpdateReturning: false,
      // No trigger system in ClickHouse.
      supportCreateUpdateTrigger: false,
    };
  }

  getCollationList(): string[] {
    return [];
  }

  async getCurrentSchema(): Promise<string | null> {
    const result = (await this.query(
      "SELECT currentDatabase() AS db"
    )) as unknown as { rows: { db?: string | null }[] };
    return result.rows[0]?.db ?? null;
  }

  async schemas(): Promise<DatabaseSchemas> {
    const dbFilter = this.selectedDatabase
      ? `name = ${this.escapeValue(this.selectedDatabase)}`
      : `name NOT IN (${SYSTEM_DATABASES.map((d) => this.escapeValue(d)).join(", ")})`;

    const tableDbFilter = this.selectedDatabase
      ? `database = ${this.escapeValue(this.selectedDatabase)}`
      : `database NOT IN (${SYSTEM_DATABASES.map((d) => this.escapeValue(d)).join(", ")})`;

    const databaseSql = `SELECT name FROM system.databases WHERE ${dbFilter}`;
    const tableSql = `SELECT database, name, engine, total_rows, total_bytes, is_temporary FROM system.tables WHERE ${tableDbFilter} AND is_temporary = 0`;
    const columnSql = `SELECT database, table, name, type, default_kind, default_expression, is_in_primary_key, comment, position FROM system.columns WHERE ${tableDbFilter} ORDER BY database, table, position`;

    const [databaseResult, tableResult, columnResult] = await this.batch([
      databaseSql,
      tableSql,
      columnSql,
    ]);

    const databases = databaseResult.rows as unknown as ClickHouseDatabaseRow[];
    const tables = tableResult.rows as unknown as ClickHouseTableRow[];
    const columns = columnResult.rows as unknown as ClickHouseColumnRow[];

    const schemas: DatabaseSchemas = {};
    for (const d of databases) {
      schemas[d.name] = [];
    }

    const tableIndex: Record<string, DatabaseSchemaItem> = {};
    for (const t of tables) {
      // Engines ending in "View" are ClickHouse views (View, MaterializedView,
      // LiveView, WindowView). Everything else is treated as a table.
      const isView = /View$/.test(t.engine);
      const item: DatabaseSchemaItem = {
        name: t.name,
        type: isView ? "view" : "table",
        tableName: t.name,
        schemaName: t.database,
        tableSchema: {
          stats: {
            sizeInByte: coerceNumeric(t.total_bytes),
            estimateRowCount: coerceNumeric(t.total_rows),
          },
          columns: [],
          autoIncrement: false,
          pk: [],
          schemaName: t.database,
          tableName: t.name,
          type: isView ? "view" : "table",
        },
      };

      tableIndex[`${t.database}.${t.name}`] = item;
      if (schemas[t.database]) {
        schemas[t.database].push(item);
      } else {
        schemas[t.database] = [item];
      }
    }

    for (const c of columns) {
      const parent = tableIndex[`${c.database}.${c.table}`];
      if (!parent?.tableSchema) continue;
      const column: DatabaseTableColumn = {
        name: c.name,
        type: c.type,
        pk: c.is_in_primary_key === 1,
        constraint: c.is_in_primary_key === 1 ? { primaryKey: true } : undefined,
      };
      if (c.default_kind && c.default_expression) {
        column.constraint = {
          ...column.constraint,
          defaultExpression: c.default_expression,
        };
      }
      parent.tableSchema.columns.push(column);
      if (c.is_in_primary_key === 1) {
        parent.tableSchema.pk.push(c.name);
      }
    }

    return schemas;
  }

  async tableSchema(
    schemaName: string,
    tableName: string
  ): Promise<DatabaseTableSchema> {
    const columnResult = (
      await this.query(
        `SELECT name, type, default_kind, default_expression, is_in_primary_key, comment, position FROM system.columns WHERE database = ${this.escapeValue(schemaName)} AND table = ${this.escapeValue(tableName)} ORDER BY position`
      )
    ).rows as unknown as ClickHouseColumnRow[];

    const columns: DatabaseTableColumn[] = columnResult.map((c) => {
      const col: DatabaseTableColumn = {
        name: c.name,
        type: c.type,
        pk: c.is_in_primary_key === 1,
        constraint: c.is_in_primary_key === 1 ? { primaryKey: true } : undefined,
      };
      if (c.default_kind && c.default_expression) {
        col.constraint = {
          ...col.constraint,
          defaultExpression: c.default_expression,
        };
      }
      return col;
    });

    const pk = columns.filter((c) => c.pk).map((c) => c.name);

    return {
      autoIncrement: false,
      pk,
      schemaName,
      tableName,
      columns,
      constraints: pk.length
        ? [{ name: `${tableName}_pkey`, primaryKey: true, primaryColumns: pk }]
        : [],
    };
  }

  /**
   * Override the default implementation because ClickHouse uses
   * `ALTER TABLE ... UPDATE/DELETE` for mutations (not plain UPDATE/DELETE),
   * has no per-row `RETURNING`, and has no transactional semantics. We build
   * per-op SQL here and fall back to SELECTs after to fetch the resulting rows.
   */
  async updateTableData(
    schemaName: string,
    tableName: string,
    ops: DatabaseTableOperation[],
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]> {
    if (validateSchema) {
      this.validateUpdateOperation(ops, validateSchema);
    }

    const fqTable = `${this.escapeId(schemaName)}.${this.escapeId(tableName)}`;
    const results: DatabaseTableOperationReslt[] = [];

    for (const op of ops) {
      if (op.operation === "INSERT") {
        const cols = Object.keys(op.values);
        const colList = cols.map((c) => this.escapeId(c)).join(", ");
        const valList = cols
          .map((c) => this.escapeValue(op.values[c]))
          .join(", ");
        await this.query(
          `INSERT INTO ${fqTable} (${colList}) VALUES (${valList})`
        );
        if (op.pk && op.pk.length > 0) {
          const pkFilter = op.pk.reduce<Record<string, unknown>>((acc, k) => {
            acc[k] = op.values[k];
            return acc;
          }, {});
          const found = await this.findFirst(schemaName, tableName, pkFilter);
          results.push({ record: found.rows[0] });
        } else {
          results.push({});
        }
      } else if (op.operation === "DELETE") {
        const where = this.buildWhere(op.where);
        await this.query(`ALTER TABLE ${fqTable} DELETE WHERE ${where}`);
        results.push({});
      } else {
        const setClause = Object.keys(op.values)
          .map(
            (c) => `${this.escapeId(c)} = ${this.escapeValue(op.values[c])}`
          )
          .join(", ");
        const where = this.buildWhere(op.where);
        await this.query(
          `ALTER TABLE ${fqTable} UPDATE ${setClause} WHERE ${where}`
        );
        // Mutations are asynchronous — the read-back may race. Best-effort
        // fetch using the original where clause so the UI still reflects
        // the caller's intent.
        const merged: Record<string, DatabaseValue> = { ...op.where };
        for (const k of Object.keys(op.values)) {
          merged[k] = op.values[k];
        }
        const found = await this.findFirst(schemaName, tableName, op.where);
        results.push({ record: found.rows[0] ?? merged });
      }
    }

    return results;
  }

  private buildWhere(where: Record<string, DatabaseValue>): string {
    const parts = Object.entries(where).map(([k, v]) => {
      if (v === null || v === undefined) {
        return `${this.escapeId(k)} IS NULL`;
      }
      return `${this.escapeId(k)} = ${this.escapeValue(v)}`;
    });
    return parts.length ? parts.join(" AND ") : "1 = 1";
  }

  async dropTable(schemaName: string, tableName: string): Promise<void> {
    await this.query(
      `DROP TABLE ${this.escapeId(schemaName)}.${this.escapeId(tableName)}`
    );
  }

  async emptyTable(schemaName: string, tableName: string): Promise<void> {
    await this.query(
      `TRUNCATE TABLE ${this.escapeId(schemaName)}.${this.escapeId(tableName)}`
    );
  }

  createUpdateTableSchema(change: DatabaseTableSchemaChange): string[] {
    return generateClickHouseSchemaChange(this, change);
  }

  createUpdateDatabaseSchema(): string[] {
    // Scoped connections are managed at the Outerbase layer; for direct
    // connections, creating a database is a single statement.
    throw new Error(
      "Database create/update is not supported yet for ClickHouse"
    );
  }

  // -- Triggers / views --------------------------------------------------
  // ClickHouse has no trigger concept, so these throw. Materialized views
  // exist but don't map cleanly onto the generic DatabaseViewSchema shape;
  // `supportCreateUpdateTrigger` is false in `getFlags()` and the Studio
  // UI won't surface these affordances.

  trigger(): Promise<DatabaseTriggerSchema> {
    throw new Error("Triggers are not supported in ClickHouse");
  }

  createTrigger(): string {
    throw new Error("Triggers are not supported in ClickHouse");
  }

  dropTrigger(): string {
    throw new Error("Triggers are not supported in ClickHouse");
  }

  async view(schemaName: string, name: string): Promise<DatabaseViewSchema> {
    const result = await this.query(
      `SELECT as_select FROM system.tables WHERE database = ${this.escapeValue(schemaName)} AND name = ${this.escapeValue(name)}`
    );
    const row = result.rows[0] as { as_select?: string } | undefined;
    if (!row) throw new Error("View does not exist");
    return {
      schemaName,
      name,
      statement: (row.as_select ?? "").trim(),
    };
  }

  createView(view: DatabaseViewSchema): string {
    return `CREATE VIEW ${this.escapeId(view.schemaName)}.${this.escapeId(view.name)} AS ${view.statement}`;
  }

  dropView(schemaName: string, name: string): string {
    return `DROP VIEW IF EXISTS ${this.escapeId(schemaName)}.${this.escapeId(name)}`;
  }

  inferTypeFromHeader(header?: DatabaseTableColumn): ColumnType | undefined {
    if (!header) return undefined;
    return clickhouseTypeToColumnType(header.type);
  }
}

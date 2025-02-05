import { validateOperation } from "@/lib/validation";
import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  DatabaseValue,
  SelectFromTableOptions,
} from "./base-driver";
import { deleteFrom, insertInto, updateTable } from "./query-builder";
import { escapeSqlValue } from "./sqlite/sql-helper";

export default abstract class CommonSQLImplement extends BaseDriver {
  protected validateUpdateOperation(
    ops: DatabaseTableOperation[],
    validateSchema: DatabaseTableSchema
  ) {
    for (const op of ops) {
      const { valid, reason } = validateOperation(op, validateSchema);
      if (!valid) {
        throw new Error(reason);
      }
    }
  }

  async getCurrentSchema(): Promise<string | null> {
    return null;
  }

  async batch(stmts: string[]): Promise<DatabaseResultSet[]> {
    const result: DatabaseResultSet[] = [];

    for (const stmt of stmts) {
      result.push(await this.query(stmt));
    }

    return result;
  }

  getCollationList(): string[] {
    return [];
  }

  async updateTableData(
    schemaName: string,
    tableName: string,
    ops: DatabaseTableOperation[],
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]> {
    if (validateSchema) {
      this.validateUpdateOperation(ops, validateSchema);
    }

    const sqls = ops.map((op) => {
      if (op.operation === "INSERT")
        return insertInto(
          this,
          schemaName,
          tableName,
          op.values,
          this.getFlags().supportInsertReturning,
          this.getFlags().supportRowId
        );

      if (op.operation === "DELETE")
        return deleteFrom(this, schemaName, tableName, op.where);

      return updateTable(
        this,
        schemaName,
        tableName,
        op.values,
        op.where,
        this.getFlags().supportInsertReturning,
        this.getFlags().supportRowId
      );
    });

    const result = await this.transaction(sqls);

    const tmp: DatabaseTableOperationReslt[] = [];

    for (let i = 0; i < result.length; i++) {
      const r = result[i];
      const op = ops[i];

      if (!r || !op) {
        tmp.push({});
        continue;
      }

      if (op.operation === "UPDATE") {
        if (r.rows.length === 1)
          // This is when database support RETURNING
          tmp.push({
            record: r.rows[0],
          });
        else {
          const selectResult = await this.findFirst(
            schemaName,
            tableName,
            op.where
          );

          tmp.push({
            lastId: r.lastInsertRowid,
            record: selectResult.rows[0],
          });
        }
      } else if (op.operation === "INSERT") {
        if (r.rows.length === 1) {
          tmp.push({
            record: r.rows[0],
          });
        } else if (op.autoIncrementPkColumn) {
          const selectResult = await this.findFirst(schemaName, tableName, {
            [op.autoIncrementPkColumn]: r.lastInsertRowid,
          });

          tmp.push({
            record: selectResult.rows[0],
            lastId: r.lastInsertRowid,
          });
        } else if (op.pk && op.pk.length > 0) {
          const selectResult = await this.findFirst(
            schemaName,
            tableName,
            op.pk.reduce<Record<string, unknown>>((a, b) => {
              a[b] = op.values[b];
              return a;
            }, {})
          );

          tmp.push({
            record: selectResult.rows[0],
            lastId: r.lastInsertRowid,
          });
        } else {
          tmp.push({});
        }
      } else {
        tmp.push({});
      }
    }

    return tmp;
  }

  async findFirst(
    schemaName: string,
    tableName: string,
    key: Record<string, DatabaseValue>
  ): Promise<DatabaseResultSet> {
    const wherePart = Object.entries(key)
      .map(([colName, colValue]) => {
        return `${this.escapeId(colName)} = ${escapeSqlValue(colValue)}`;
      })
      .join(" AND ");

    const sql = `SELECT * FROM ${this.escapeId(schemaName)}.${this.escapeId(tableName)} ${wherePart ? "WHERE " + wherePart : ""} LIMIT 1 OFFSET 0`;
    return this.query(sql);
  }

  async selectTable(
    schemaName: string,
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }> {
    const whereRaw = options.whereRaw?.trim();

    const orderPart =
      options.orderBy && options.orderBy.length > 0
        ? options.orderBy
            .map((r) => `${this.escapeId(r.columnName)} ${r.by}`)
            .join(", ")
        : "";

    const sql = `SELECT * FROM ${this.escapeId(schemaName)}.${this.escapeId(tableName)}${
      whereRaw ? ` WHERE ${whereRaw} ` : ""
    } ${orderPart ? ` ORDER BY ${orderPart}` : ""} LIMIT ${escapeSqlValue(options.limit)} OFFSET ${escapeSqlValue(options.offset)};`;

    return {
      data: await this.query(sql),
      schema: await this.tableSchema(schemaName, tableName),
    };
  }

  async dropTable(schemaName: string, tableName: string): Promise<void> {
    await this.query(
      `DROP TABLE ${this.escapeId(schemaName)}.${this.escapeId(tableName)};`
    );
  }

  async emptyTable(schemaName: string, tableName: string): Promise<void> {
    await this.query(
      `DELETE FROM ${this.escapeId(schemaName)}.${this.escapeId(tableName)};`
    );
  }
}

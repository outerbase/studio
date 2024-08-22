import { validateOperation } from "@/components/lib/validation";
import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  DatabaseValue,
  SelectFromTableOptions,
} from "./base-driver";
import { escapeSqlValue } from "./sqlite/sql-helper";
import {
  deleteFrom,
  insertInto,
  selectFrom,
  updateTable,
} from "./query-builder";

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
        return insertInto(this, schemaName, tableName, op.values);
      if (op.operation === "DELETE")
        return deleteFrom(this, schemaName, tableName, op.where);

      return updateTable(this, schemaName, tableName, op.values, op.where);
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
        const selectStatement = selectFrom(
          this,
          schemaName,
          tableName,
          op.where,
          { limit: 1, offset: 0 }
        );

        // This transform to make it friendly for sending via HTTP
        const selectResult = await this.query(selectStatement);

        tmp.push({
          lastId: r.lastInsertRowid,
          record: selectResult.rows[0],
        });
      } else if (op.operation === "INSERT") {
        if (op.autoIncrementPkColumn) {
          const selectStatement = selectFrom(
            this,
            schemaName,
            tableName,
            { [op.autoIncrementPkColumn]: r.lastInsertRowid },
            { limit: 1, offset: 0 }
          );

          // This transform to make it friendly for sending via HTTP
          const selectResult = await this.query(selectStatement);

          tmp.push({
            record: selectResult.rows[0],
            lastId: r.lastInsertRowid,
          });
        } else if (op.pk && op.pk.length > 0) {
          const selectStatement = selectFrom(
            this,
            schemaName,
            tableName,
            op.pk.reduce<Record<string, unknown>>((a, b) => {
              a[b] = op.values[b];
              return a;
            }, {}),
            { limit: 1, offset: 0 }
          );

          // This transform to make it friendly for sending via HTTP
          const selectResult = await this.query(selectStatement);

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
      .join(", ");

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
}

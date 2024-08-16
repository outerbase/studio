import { validateOperation } from "@/components/lib/validation";
import {
  BaseDriver,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
} from "./base-driver";
import {
  generateDeleteStatement,
  generateInsertStatement,
  generateSelectOneWithConditionStatement,
  generateUpdateStatement,
} from "./sqlite/sql-helper";

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
    tableName: string,
    ops: DatabaseTableOperation[],
    validateSchema?: DatabaseTableSchema
  ): Promise<DatabaseTableOperationReslt[]> {
    if (validateSchema) {
      this.validateUpdateOperation(ops, validateSchema);
    }

    const sqls = ops.map((op) => {
      if (op.operation === "INSERT")
        return generateInsertStatement(tableName, op.values);
      if (op.operation === "DELETE")
        return generateDeleteStatement(tableName, op.where);

      return generateUpdateStatement(tableName, op.where, op.values);
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
        const selectStatement = generateSelectOneWithConditionStatement(
          tableName,
          op.where
        );

        // This transform to make it friendly for sending via HTTP
        const selectResult = await this.query(selectStatement);

        tmp.push({
          lastId: r.lastInsertRowid,
          record: selectResult.rows[0],
        });
      } else if (op.operation === "INSERT") {
        if (op.autoIncrementPkColumn) {
          const selectStatement = generateSelectOneWithConditionStatement(
            tableName,
            { [op.autoIncrementPkColumn]: r.lastInsertRowid }
          );

          // This transform to make it friendly for sending via HTTP
          const selectResult = await this.query(selectStatement);

          tmp.push({
            record: selectResult.rows[0],
            lastId: r.lastInsertRowid,
          });
        } else if (op.pk && op.pk.length > 0) {
          const selectStatement = generateSelectOneWithConditionStatement(
            tableName,
            op.pk.reduce<Record<string, unknown>>((a, b) => {
              a[b] = op.values[b];
              return a;
            }, {})
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
}

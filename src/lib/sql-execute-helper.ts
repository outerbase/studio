import OptimizeTableState, {
  OptimizeTableRowValue,
} from "@/components/table-optimized/OptimizeTableState";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { validateOperation } from "@/lib/validation";
import {
  generateDeleteStatement,
  generateInsertStatement,
  generateSelectOneWithConditionStatement,
  generateUpdateStatement,
} from "./sql-helper";
import { DatabaseTableSchema } from "@/drivers/base-driver";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  sql: string;
  tableName: string;
  autoIncrement: boolean;
  updateCondition: Record<string, unknown>;
  updatedRowData?: Record<string, unknown>;
}

function generateTableChangePlan({
  tableName,
  tableSchema,
  data,
}: {
  tableName: string;
  tableSchema: DatabaseTableSchema;
  data: OptimizeTableState;
}): { error: string | null; plans: ExecutePlan[] } {
  const rowChangeList = data.getChangedRows();
  const plans: ExecutePlan[] = [];

  for (const row of rowChangeList) {
    const rowChange = row.change;
    if (rowChange) {
      const pk = tableSchema.pk;

      const wherePrimaryKey = pk.reduce((condition, pkColumnName) => {
        condition[pkColumnName] = row.raw[pkColumnName];
        return condition;
      }, {} as Record<string, unknown>);

      let operation: "UPDATE" | "INSERT" | "DELETE" = "UPDATE";
      if (row.isNewRow) operation = "INSERT";
      if (row.isRemoved) operation = "DELETE";

      const { valid, reason } = validateOperation({
        operation,
        autoIncrement: tableSchema.autoIncrement,
        changeValue: rowChange,
        originalValue: row.raw,
        primaryKey: tableSchema.pk,
      });

      if (!valid) {
        return { plans: [], error: reason ?? "" };
      }

      let sql: string | undefined;

      if (row.isNewRow) {
        sql = generateInsertStatement(tableName, rowChange);
      } else if (row.isRemoved) {
        sql = generateDeleteStatement(tableName, wherePrimaryKey);
      } else {
        sql = generateUpdateStatement(tableName, wherePrimaryKey, rowChange);
      }

      plans.push({
        sql,
        row,
        tableName,
        updateCondition: wherePrimaryKey,
        autoIncrement: tableSchema.autoIncrement,
      });
    }
  }

  return { plans, error: null };
}

export async function executePlans(
  driver: DatabaseDriver,
  plans: ExecutePlan[]
): Promise<{ success: boolean; plans: ExecutePlan[]; error?: string }> {
  try {
    const results = await driver.transaction(plans.map((plan) => plan.sql));

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const result = results[i];

      if (
        plan.autoIncrement &&
        Object.values(plan.updateCondition)[0] === undefined
      ) {
        plan.updateCondition[Object.keys(plan.updateCondition)[0]] = Number(
          result.lastInsertRowid
        );
      }

      let updateResult = {};
      if (!plan.row.isRemoved) {
        updateResult = (
          await driver.query(
            generateSelectOneWithConditionStatement(
              plan.tableName,
              plan.updateCondition
            )
          )
        ).rows[0];
      }

      plan.updatedRowData = { ...updateResult };
    }

    return { success: true, plans };
  } catch (e) {
    return { success: false, error: (e as Error).toString(), plans: [] };
  }
}

export async function commitChange({
  driver,
  tableName,
  tableSchema,
  data,
}: {
  driver: DatabaseDriver;
  tableName: string;
  tableSchema: DatabaseTableSchema;
  data: OptimizeTableState;
}): Promise<{ errorMessage?: string }> {
  const { plans, error: planErrorMessage } = generateTableChangePlan({
    tableName,
    tableSchema,
    data,
  });

  if (planErrorMessage) {
    return { errorMessage: planErrorMessage };
  }

  if (plans.length > 0) {
    try {
      const {
        success,
        error: errorMessage,
        plans: executedPlans,
      } = await executePlans(driver, plans);

      if (success) {
        data.applyChanges(
          executedPlans.map((plan) => ({
            row: plan.row,
            updated: plan.updatedRowData ?? {},
          }))
        );
      } else {
        return { errorMessage };
      }
    } catch (e) {
      return { errorMessage: (e as Error).message };
    }
  }

  return {};
}

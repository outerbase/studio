import { OptimizeTableRowValue } from "@/app/(components)/OptimizeTable/OptimizeTableState";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { generateSelectOneWithConditionStatement } from "./sql-helper";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  sql: string;
  tableName: string;
  autoIncrement: boolean;
  updateCondition: Record<string, unknown>;
  updatedRowData?: Record<string, unknown>;
}

export async function executePlans(
  driver: DatabaseDriver,
  plans: ExecutePlan[]
): Promise<{ success: boolean; plans: ExecutePlan[]; error?: string }> {
  try {
    await driver.query("BEGIN TRANSACTION;");

    for (const plan of plans) {
      const result = await driver.query(plan.sql);

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

    await driver.query("COMMIT");
    return { success: true, plans };
  } catch (e) {
    await driver.query("ROLLBACK");
    return { success: false, error: (e as any).toString(), plans: [] };
  }
}

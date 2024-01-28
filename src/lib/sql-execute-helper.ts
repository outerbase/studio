import { OptimizeTableRowValue } from "@/app/(components)/OptimizeTable/OptimizeTableState";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { generateSelectOneWithConditionStatement } from "./sql-helper";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  sql: string;
  tableName: string;
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
      await driver.query(plan.sql);

      // Get the updated value
      const updateResult = await driver.query(
        generateSelectOneWithConditionStatement(
          plan.tableName,
          plan.updateCondition
        )
      );

      plan.updatedRowData = { ...updateResult.rows[0] };
    }

    await driver.query("COMMIT");
    return { success: true, plans };
  } catch (e) {
    await driver.query("ROLLBACK");
    return { success: false, error: (e as any).toString(), plans: [] };
  }
}

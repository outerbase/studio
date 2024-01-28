import { OptimizeTableRowValue } from "@/app/(components)/OptimizeTable/OptimizeTableState";
import DatabaseDriver from "@/drivers/DatabaseDriver";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  sql: string;
}

export async function executePlans(
  driver: DatabaseDriver,
  plans: ExecutePlan[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await driver.query("BEGIN TRANSACTION;");

    for (const plan of plans) {
      const result = await driver.query(plan.sql);
    }

    await driver.query("COMMIT");
    return { success: true };
  } catch (e) {
    await driver.query("ROLLBACK");
    return { success: false, error: (e as any).toString() };
  }
}

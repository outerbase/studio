import { OptimizeTableRowValue } from "@/app/(components)/OptimizeTable/OptimizeTableState";
import DatabaseDriver from "@/drivers/DatabaseDriver";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  sql: string;
}

export async function executePlans(
  driver: DatabaseDriver,
  plans: ExecutePlan[]
) {
  try {
    await driver.query("BEGIN TRANSACTION;");

    for (const plan of plans) {
      await driver.query(plan.sql);
    }

    await driver.query("COMMIT");
  } catch {
    await driver.query("ROLLBACK");
  }
}

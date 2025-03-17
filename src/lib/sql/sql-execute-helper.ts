import OptimizeTableState, {
  OptimizeTableRowValue,
} from "@/components/gui/table-optimized/optimize-table-state";
import {
  BaseDriver,
  DatabaseTableOperation,
  DatabaseTableSchema,
} from "@/drivers/base-driver";

export interface ExecutePlan {
  row: OptimizeTableRowValue;
  plan: DatabaseTableOperation;
}

function generateTableChangePlan({
  tableSchema,
  data,
}: {
  tableSchema: DatabaseTableSchema;
  data: OptimizeTableState;
}): ExecutePlan[] {
  const rowChangeList = data.getChangedRows();
  const plans: ExecutePlan[] = [];

  for (const row of rowChangeList) {
    const rowChange = row.change;
    if (rowChange) {
      const pk = tableSchema.pk;

      const wherePrimaryKey = pk.reduce<Record<string, unknown>>(
        (condition, pkColumnName) => {
          condition[pkColumnName] = row.raw[pkColumnName];
          return condition;
        },
        {}
      );

      if (row.isNewRow) {
        plans.push({
          row,
          plan: {
            operation: "INSERT",
            values: rowChange,
            autoIncrementPkColumn: tableSchema.autoIncrement
              ? tableSchema.pk[0]
              : undefined,
            pk: tableSchema.pk,
          },
        });
      } else if (row.isRemoved) {
        plans.push({
          row,
          plan: { operation: "DELETE", where: wherePrimaryKey },
        });
      } else {
        plans.push({
          row,
          plan: {
            operation: "UPDATE",
            where: wherePrimaryKey,
            values: rowChange,
          },
        });
      }
    }
  }

  return plans;
}

export async function commitChange({
  driver,
  tableName,
  tableSchema,
  data,
}: {
  driver: BaseDriver;
  tableName: string;
  tableSchema: DatabaseTableSchema;
  data: OptimizeTableState;
}): Promise<{ errorMessage?: string }> {
  const plans = generateTableChangePlan({
    tableSchema,
    data,
  });

  try {
    const result = await driver.updateTableData(
      tableSchema.schemaName,
      tableName,
      plans.map((p) => p.plan),
      tableSchema
    );

    data.applyChanges(
      plans.map((p, idx) => {
        return {
          row: p.row,
          updated: result[idx]?.record ?? {},
        };
      })
    );
  } catch (e) {
    return { errorMessage: (e as Error).message };
  }

  return {};
}

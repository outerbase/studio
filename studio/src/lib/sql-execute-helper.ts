import  {
  OptimizeTableState,
  OptimizeTableRowValue,
} from "@libsqlstudio/gui";
import {
  BaseDriver,
  DatabaseTableOperation,
  DatabaseTableSchema,
} from "@libsqlstudio/gui";

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

      const wherePrimaryKey = pk.reduce(
        (condition, pkColumnName) => {
          condition[pkColumnName] = row.raw[pkColumnName];
          return condition;
        },
        {} as Record<string, unknown>
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
      tableName,
      plans.map((p) => p.plan),
      tableSchema
    );

    data.applyChanges(
      plans.map((p, idx) => {
        return {
          row: p.row,
          updated: result[idx].record ?? {},
        };
      })
    );
  } catch (e) {
    return { errorMessage: (e as Error).message };
  }

  return {};
}

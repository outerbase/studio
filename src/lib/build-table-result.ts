import { OptimizeTableHeaderProps } from "@/components/gui/table-optimized";
import { DatabaseSchemas } from "@/drivers/base-driver";

interface BuiuldTableResultProps {
  result: DatabaseResultSet;
  driver: BaseDriver;
  tableSchema: DatabaseTableSchema;
  schemas: DatabaseSchemas;
}

export function buildTableResultHeader({
  result,
  driver,
  tableSchema,
  schemas,
}: BuiuldTableResultProps): OptimizeTableHeaderProps[] {}

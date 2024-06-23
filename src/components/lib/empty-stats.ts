import { DatabaseResultStat } from "@/drivers/base-driver";

export default function isEmptyResultStats(stats: DatabaseResultStat) {
  return (
    !stats.queryDurationMs &&
    !stats.rowsAffected &&
    !stats.rowsRead &&
    !stats.rowsWritten
  );
}

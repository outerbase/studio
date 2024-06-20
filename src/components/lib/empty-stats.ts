import { DatabaseResultStat } from "@/driver";

export default function isEmptyResultStats(stats: DatabaseResultStat) {
  return (
    !stats.queryDurationMs &&
    !stats.rowsAffected &&
    !stats.rowsRead &&
    !stats.rowsWritten
  );
}

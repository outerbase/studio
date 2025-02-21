import { DatabaseResultStat } from "@/drivers/base-driver";

export default function ResultStats({ stats }: { stats: DatabaseResultStat }) {
  return (
    <div className="text-sm p-2 flex">
      {stats.queryDurationMs !== null && (
        <div className="px-2 border-r">
          <span className="font-semibold">Query Duration</span>:{" "}
          {stats.queryDurationMs}ms
        </div>
      )}

      {!!stats.rowsRead && (
        <div className="px-2 border-r">
          <span className="font-semibold">Rows Read</span>: {stats.rowsRead}
        </div>
      )}

      {!!stats.rowsWritten && (
        <div className="px-2 border-r">
          <span className="font-semibold">Rows Written</span>:{" "}
          {stats.rowsWritten}
        </div>
      )}

      {!!stats.rowsAffected && (
        <div className="px-2">
          <span className="font-semibold">Affected Rows</span>:{" "}
          {stats.rowsAffected}
        </div>
      )}
    </div>
  );
}

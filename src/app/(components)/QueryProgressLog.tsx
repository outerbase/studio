import { MultipleQueryProgress } from "@/lib/multiple-query";
import { useEffect, useState } from "react";

function formatTimeAgo(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}s`;
  }
}

export default function QueryProgressLog({
  progress,
}: {
  progress: MultipleQueryProgress;
}) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!progress.error) {
      const intervalId = setInterval(() => setCurrentTime(Date.now()), 200);
      return () => clearInterval(intervalId);
    }
  }, [progress]);

  const last3 = progress.logs.slice(-3).reverse();
  const value = progress.progress;
  const total = progress.total;
  const isEnded = total === value || !!progress.error;

  return (
    <div className="p-4 overflow-hidden">
      <div>
        {isEnded ? (
          <strong>
            Executed {value}/{total}
          </strong>
        ) : (
          <strong>
            Executing {value}/{total}
          </strong>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {last3.map((detail) => {
          return (
            <div key={detail.order}>
              {detail.end && !detail.error && (
                <div className="text-sm">
                  <strong>[Query #{detail.order + 1}]</strong> This query took{" "}
                  {formatTimeAgo(detail.end - detail.start)} and affected{" "}
                  {detail.affectedRow} row(s).
                </div>
              )}

              {!!detail.error && (
                <div className="mt-2 mb-2 text-red-500">
                  <pre>{detail.error}</pre>
                </div>
              )}

              {!detail.end && (
                <div className="text-sm">
                  Executing this query&nbsp;
                  <strong>
                    {formatTimeAgo(Date.now() - detail.start)}
                  </strong>{" "}
                  ago.
                </div>
              )}
              <code className="p-2 bg-yellow-50 block mt-2 overflow-x-auto w-full text-sm">
                <pre>{detail.sql}</pre>
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

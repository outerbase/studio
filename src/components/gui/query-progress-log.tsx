import { useEffect, useState } from "react";
import CodePreview from "./code-preview";
import ResultStats from "./result-stat";
import { MultipleQueryProgress } from "@/lib/sql/multiple-query";
import isEmptyResultStats from "@/lib/empty-state";

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
  const [, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (progress.progress < progress.total) {
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
              {!!detail.error && (
                <div className="mt-2 mb-2 text-red-500 font-mono">
                  {detail.error}
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

              <div className="mt-3" />
              <CodePreview code={detail.sql} />

              {detail.end &&
                !detail.error &&
                detail.stats &&
                !isEmptyResultStats(detail.stats) && (
                  <div className="-ml-4">
                    <ResultStats stats={detail.stats} />
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

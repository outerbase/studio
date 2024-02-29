"use client";
import QueryProgressLog from "@/components/query-progress-log";
import { useMemo } from "react";

export default function QueryProgressStorybook() {
  const fakeProgress = useMemo(
    () => ({
      logs: [
        {
          order: 0,
          sql: 'INSERT INTO products(id, name) VALUES(20, "Book 1")',
          start: 1705664174179,
          end: 1705664179226,
          affectedRow: 1,
        },
        {
          order: 1,
          sql: 'INSERT INTO products(id, name) VALUES(21, "Book 2")',
          start: 1705664179226,
          end: 1705664184260,
          affectedRow: 1,
        },
        {
          order: 2,
          sql: 'INSERT INTO products(id, name) VALUES(22, "Book 3")',
          start: Date.now(),
          affectedRow: 1,
        },
      ],
      progress: 2,
      total: 3,
    }),
    []
  );

  const fakeProgressWithError = useMemo(
    () => ({
      logs: [
        {
          order: 0,
          sql: 'INSERT INTO products(id, name) VALUES(20, "Book 1")',
          start: 1705667823499,
          end: 1705667823534,
          error:
            "ResponseError: SQLite error: UNIQUE constraint failed: products.id",
        },
      ],
      progress: 0,
      total: 3,
      error: true,
    }),
    []
  );

  return (
    <div>
      <div className="border m-3">
        <QueryProgressLog progress={fakeProgress} />
      </div>
      <div className="border m-3">
        <QueryProgressLog progress={fakeProgressWithError} />
      </div>
    </div>
  );
}

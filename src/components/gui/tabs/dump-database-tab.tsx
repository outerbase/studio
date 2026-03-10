"use client";
import { Button } from "@/components/ui/button";
import { useStudioContext } from "@/context/driver-provider";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

function downloadBlob(
  data: Blob | Uint8Array | ArrayBuffer | string,
  filename: string,
  mimeType?: string
) {

  let blob: Blob;
  if (data instanceof Blob) {
    blob = mimeType && data.type !== mimeType ? new Blob([data], { type: mimeType }) : data;
  } else if (data instanceof Uint8Array) {
    const bytes = new Uint8Array(data); // ensure ArrayBuffer-backed copy
    blob = new Blob([bytes.buffer], { type: mimeType || "application/octet-stream" });
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mimeType || "application/octet-stream" });
  } else {
    blob = new Blob([data], { type: mimeType || "text/plain;charset=utf-8" });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);

  // Some browsers (Firefox, Safari) require the element to be in the DOM
  // and the revocation to occur after the event loop tick.
  const supportsDownload = typeof a.download !== "undefined";
  if (!supportsDownload) {
    window.open(url, "_blank");
    // Best-effort cleanup later if we can't rely on download attribute
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    document.body.removeChild(a);
    return;
  }

  a.click();

  // Cleanup on next tick to avoid revoking too early
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export default function DumpDatabaseTab() {
  const { databaseDriver, name } = useStudioContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = useMemo(() => {
    try {
      const flags = databaseDriver.getFlags?.();
      return !!(flags && (flags as any).supportDumpDatabase);
    } catch {
      return false;
    }
  }, [databaseDriver]);

  const onDump = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Prefer driver-provided dump if available
      const anyDriver = databaseDriver as unknown as {
        dumpDatabase?: () => Promise<{ data: Blob | Uint8Array | ArrayBuffer | string; filename?: string; mimeType?: string }>;
      };

      if (!anyDriver.dumpDatabase) {
        throw new Error("Dump is not supported for this database");
      }

      const result = await anyDriver.dumpDatabase();
      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");
      const filename = result.filename || `${name || "database"}-${ts}.db`;

      downloadBlob(result.data, filename, result.mimeType);
      toast.success("Database dump downloaded");
    } catch (e: any) {
      const msg = e?.message || "Failed to dump database";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [databaseDriver, name]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b pb-1">
        <h1 className="text-primary mb-1 border-b p-4 text-lg font-semibold">Dump Database to File</h1>
        <div className="px-4 pb-3 text-sm text-muted-foreground">
          Download a full backup of your database as a file.
        </div>
        <div className="px-4 pb-4">
          <Button disabled={loading || !supported} onClick={onDump}>
            {loading ? "Preparing dump..." : supported ? "Dump to file" : "Not supported"}
          </Button>
        </div>
      </div>
      {error && (
        <div className="p-4 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}

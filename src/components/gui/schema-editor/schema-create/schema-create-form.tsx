import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseSchemaChange } from "@/drivers/base-driver";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export function SchemaDatabaseCreateForm({
  schemaName,
  onClose,
}: {
  schemaName?: string;
  onClose: () => void;
}) {
  const { databaseDriver } = useStudioContext();
  const { schema, refresh: refreshSchema } = useSchema();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [value, setValue] = useState<DatabaseSchemaChange>({
    name: {
      new: "",
      old: "",
    },
    createScript: "",
    collate: "",
  });

  const previewScript = useMemo(() => {
    return databaseDriver.createUpdateDatabaseSchema(value).join(";\n");
  }, [databaseDriver, value]);

  const onSave = useCallback(() => {
    {
      setIsExecuting(true);
      databaseDriver
        .transaction([previewScript])
        .then(() => {
          refreshSchema();
          onClose();
        })
        .catch((err) => setErrorMessage((err as Error).message))
        .finally(() => {
          setIsExecuting(false);
        });
    }
  }, [databaseDriver, onClose, previewScript, refreshSchema]);

  const schemaNames = Object.keys(schema)
    .filter((s) => s !== schemaName)
    .map((s) => s);
  const schemaNameExists = schemaNames.includes(value.name.new || "");

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {errorMessage && (
        <div className="flex items-end justify-end gap-4 font-mono text-sm text-red-500">
          <LucideAlertCircle className="h-12 w-12" />
          <p>{errorMessage}</p>
        </div>
      )}
      <div className="flex shrink-0 grow-0 gap-2 border-neutral-200 px-1 py-4 dark:border-neutral-800">
        <div className="w-full">
          <div className="mb-1 text-xs font-medium">Schema Name</div>
          <Input
            placeholder="Schema Name"
            value={value.name.new || value.name.old || ""}
            onChange={(e) => {
              setValue({
                ...value,
                name: {
                  ...value.name,
                  new: e.currentTarget.value,
                },
              });
            }}
            disabled={!!schemaName}
            className={`w-full ${schemaNameExists ? "border-red-600" : ""}`}
          />
          {schemaNameExists && (
            <small className="text-xs text-red-500">
              The schema name `{value.name.new}` already exists.
            </small>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col pt-3">
        <div className="shrink-0 grow-0">
          <div className="flex justify-end gap-2 p-1">
            <Button
              variant="ghost"
              disabled={!!schemaNameExists}
              size={"sm"}
              onClick={onSave}
            >
              {isExecuting ? (
                <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LucideSave className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

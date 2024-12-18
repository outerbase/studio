import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchema } from "@/context/schema-provider";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import { DatabaseSchemaChange } from "@/drivers/base-driver";
import { SchemaDatabaseCollation } from "./schema-database-collation";

export function SchemaDatabaseCreateForm({ schemaName, onClose }: { schemaName?: string; onClose: () => void; }) {
  const { databaseDriver } = useDatabaseDriver();
  const { schema, refresh: refreshSchema } = useSchema();
  const [loading, setLoading] = useState(false);
  const [currentCollate, setCurrentCollate] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [value, setValue] = useState<DatabaseSchemaChange>({
    name: {
      new: '',
      old: ''
    },
    createScript: '',
    collate: ''
  });

  const previewScript = useMemo(() => {
    return databaseDriver.createUpdateDatabaseSchema(value).join(";\n");
  }, [databaseDriver, value]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const { rows } = await databaseDriver.query(`
        SELECT \`DEFAULT_COLLATION_NAME\` FROM \`information_schema\`.\`SCHEMATA\` WHERE \`SCHEMA_NAME\`='${schemaName}';
        `)

      if (rows.length > 0) {
        setValue({
          ...value,
          name: {
            new: schemaName,
            old: schemaName
          },
          collate: String(rows[0].DEFAULT_COLLATION_NAME)
        })
        setCurrentCollate(String(rows[0].DEFAULT_COLLATION_NAME))
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  }, [databaseDriver, schemaName, value])

  useEffect(() => {
    if (schemaName) {
      fetchData().then().catch(console.error);
    }
  }, [])

  // const toggleSave = useCallback(() => setSaving(!isSaving), [isSaving])

  const onSave = useCallback(() => {
    {
      setIsExecuting(true);
      databaseDriver.transaction([previewScript]).then(() => {
        refreshSchema();
        onClose();
      }).catch((err) => setErrorMessage((err as Error).message)).finally(() => {
        setIsExecuting(false);
      })
    }
  }, [databaseDriver, onClose, previewScript, refreshSchema])

  const schemaNames = Object.keys(schema).filter(s => s !== schemaName).map(s => s);
  const schemaNameExists = schemaNames.includes(value.name.new || '');
  const isChange = value.name.new !== value.name.old || currentCollate !== value.collate

  return (
    <div className="flex h-full flex-col overflow-hidden relative">
      {errorMessage && (
        <div className="text-sm text-red-500 font-mono flex gap-4 justify-end items-end">
          <LucideAlertCircle className="w-12 h-12" />
          <p>{errorMessage}</p>
        </div>
      )}
      <div className="flex gap-2 shrink-0 grow-0 py-4 px-1 border-neutral-200 dark:border-neutral-800">
        <div className="w-full">
          <div className="text-xs font-medium mb-1">Schema Name</div>
          <Input
            placeholder="Schema Name"
            value={value.name.new || value.name.old || ''}
            onChange={(e) => {
              setValue({
                ...value,
                name: {
                  ...value.name,
                  new: e.currentTarget.value
                }
              })
            }}
            disabled={loading || !!schemaName}
            className={`w-full ${schemaNameExists ? 'border-red-600' : ''}`}
          />
          {
            schemaNameExists && <small className="text-xs text-red-500">The schema name `{value.name.new}` already exists.</small>
          }
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Collation</div>
          <SchemaDatabaseCollation
            value={value.collate}
            onChange={(selectedSchema) => {
              setValue({
                ...value,
                collate: selectedSchema
              })
            }}
          />
        </div>
      </div>
      <div className="w-full flex flex-col pt-3">
        <div className="grow-0 shrink-0">
          <div className="p-1 flex gap-2 justify-end">
            <Button
              variant="ghost"
              disabled={!!schemaNameExists || loading || !isChange}
              size={"sm"}
              onClick={onSave}
            >
              {isExecuting ? (
                <LucideLoader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LucideSave className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
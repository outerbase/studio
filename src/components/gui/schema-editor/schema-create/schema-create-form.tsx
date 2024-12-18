import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useSchema } from "@/context/schema-provider";
import { LucideCode, LucideSave } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import { DatabaseSchemaChange } from "@/drivers/base-driver";
import CodePreview from "../../code-preview";
import { SchemaDatabaseDialog } from "./schema-database-dialog";
import { SchemaDatabaseCollation } from "./schema-database-collation";

export function SchemaDatabaseCreateForm({ schemaName, onClose }: { schemaName?: string; onClose: () => void; }) {
  const { databaseDriver } = useDatabaseDriver();
  const { schema } = useSchema();
  const [isSaving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCollate, setCurrentCollate] = useState('');
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

  const onDiscard = useCallback(() => {
    setValue({
      ...value,
      name: {
        new: schemaName,
        old: schemaName
      },
      collate: currentCollate
    })
  }, [currentCollate, schemaName, value])

  const toggleSave = useCallback(() => setSaving(!isSaving), [isSaving])

  const schemaNames = Object.keys(schema).filter(s => s !== schemaName).map(s => s);
  const schemaNameExists = schemaNames.includes(value.name.new || '');
  const isChange = value.name.new !== value.name.old || currentCollate !== value.collate

  return (
    <div className="flex h-full flex-col overflow-hidden relative">
      {
        isSaving &&
        <SchemaDatabaseDialog
          onCloseSave={() => {
            toggleSave();
            onClose();
          }}
          previewScript={previewScript}
          schema={value}
          onCloseCancel={toggleSave}
        />
      }
      <div className="flex gap-2 shrink-0 grow-0 py-4 px-1 border-neutral-200 dark:border-neutral-800">
        <div>
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
            className={`w-[200px] ${schemaNameExists ? 'border-red-600' : ''}`}
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
              onClick={toggleSave}
            >
              <LucideSave className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              size={"sm"}
              variant="ghost"
              className="text-red-500"
              disabled={loading || !isChange}
              onClick={onDiscard}
            >
              Discard Change
            </Button>
            <div>
              <Separator orientation="vertical" />
            </div>
            <Popover>
              <PopoverTrigger>
                <div className={buttonVariants({ size: "sm", variant: "ghost" })}>
                  <LucideCode className="w-4 h-4 mr-1" />
                  SQL Preview
                </div>
              </PopoverTrigger>
              <PopoverContent style={{ width: 500 }}>
                <div className="text-xs font-semibold mb-1">SQL Preview</div>
                <div style={{ maxHeight: 400 }} className="overflow-y-auto">
                  <CodePreview code={previewScript} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Input } from "@/components/ui/input";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseViewSchema } from "@/drivers/base-driver";
import { produce } from "immer";
import { useMemo } from "react";
import SchemaNameSelect from "../../components/gui/schema-editor/schema-name-select";
import SqlEditor from "../../components/gui/sql-editor";

interface Props {
  value: DatabaseViewSchema;
  onChange: (value: DatabaseViewSchema) => void;
}

export default function ViewEditor(props: Props) {
  const { value, onChange } = props;
  const { databaseDriver } = useStudioContext();
  const { autoCompleteSchema, schema } = useSchema();

  const extendedAutoCompleteSchema = useMemo(() => {
    const currentSchema = schema[value.schemaName];
    if (!currentSchema) return autoCompleteSchema;

    return autoCompleteSchema;
  }, [autoCompleteSchema, schema, value.schemaName]);

  return (
    <>
      <div className="flex flex-row gap-2 px-4 py-2">
        <Input
          value={value.name}
          placeholder="View Name"
          onChange={(e) =>
            onChange(
              produce(value, (draft) => {
                draft.name = e.currentTarget.value;
              })
            )
          }
        />
        <div className="w-[200px]">
          <SchemaNameSelect
            value={value.schemaName}
            onChange={(schemaName) => {
              onChange(
                produce(value, (draft) => {
                  draft.schemaName = schemaName;
                })
              );
            }}
          />
        </div>
      </div>
      <div className="grow overflow-hidden">
        <div className="h-full">
          <SqlEditor
            value={value?.statement ?? ""}
            dialect={databaseDriver.getFlags().dialect}
            schema={extendedAutoCompleteSchema}
            onChange={(newStatement) =>
              onChange(
                produce(value, (draft) => {
                  draft.statement = newStatement;
                })
              )
            }
          />
        </div>
      </div>
    </>
  );
}

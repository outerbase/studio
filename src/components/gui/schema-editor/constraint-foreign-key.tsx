import { Input } from "@/components/ui/input";
import {
  DatabaseTableConstraintChange,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { Key, Plus } from "@phosphor-icons/react";
import { produce } from "immer";
import { ArrowRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import TableColumnCombobox from "../table-combobox/TableColumnCombobox";
import TableCombobox from "../table-combobox/TableCombobox";
import SchemaEditorColumnCombobox from "./schema-column-combobox";
import SchemaNameSelect from "./schema-name-select";

export default function ConstraintForeignKeyEditor({
  value,
  onChange,
}: {
  value: DatabaseTableConstraintChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
}) {
  const columnSourceList =
    value.new?.foreignKey?.columns ?? value.old?.foreignKey?.columns ?? [];

  const columnDestinationList =
    value.new?.foreignKey?.foreignColumns ??
    value.old?.foreignKey?.foreignColumns ??
    [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center font-bold text-purple-600">
        <Key className="w-4 h-4" />
        Foreign Key
      </div>

      <Input
        placeholder="Constraint Name"
        value={value.new?.name}
        onChange={(e) => {
          onChange((prev) => {
            return produce(prev, (draft) => {
              draft.constraints.forEach((c) => {
                if (c.id === value.id && c.new) {
                  c.new.name = e.target.value;
                }
              });
            });
          });
        }}
      />

      <div className="font-semibold">Reference Table</div>
      <div className="flex gap-2">
        <SchemaNameSelect onChange={() => {}} />
        <div className="w-[250px]">
          <TableCombobox schemaName="main" onChange={() => {}} />
        </div>
      </div>

      <div className="ml-4 border-l-4 flex flex-col gap-2 pl-4">
        {columnSourceList.map((column, columnIdx) => {
          return (
            <div className="flex items-center gap-2" key={columnIdx}>
              <div className="w-[200px]">
                <SchemaEditorColumnCombobox onChange={() => {}} value="" />
              </div>
              <ArrowRight className="w-4 h-4" />
              <TableColumnCombobox
                onChange={() => {}}
                schemaName=""
                tableName=""
              />
            </div>
          );
        })}

        <button
          className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center cursor-pointer"
          onClick={() => {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.constraints.forEach((c) => {
                  if (c.id === value.id && c.new?.foreignKey) {
                    c.new.foreignKey.columns = [...columnSourceList, ""];
                    c.new.foreignKey.foreignColumns = [
                      ...columnDestinationList,
                      "",
                    ];
                  }
                });
              });
            });
          }}
        >
          <Plus className="w-4 h-4" weight="bold" />
        </button>
      </div>
    </div>
  );
}

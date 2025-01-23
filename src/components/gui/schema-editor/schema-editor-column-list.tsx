import { useCommonDialog } from "@/components/common-dialog";
import { checkSchemaColumnChange } from "@/components/lib/sql-generate.schema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DatabaseTableColumn,
  DatabaseTableColumnConstraint,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Key } from "@phosphor-icons/react";
import { produce } from "immer";
import { LucidePlus, LucideTrash2, PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "../toolbar";
import ColumnCheckPopup from "./column-check-popup";
import ColumnCollation from "./column-collation";
import ColumnDefaultValueInput from "./column-default-value-input";
import ColumnForeignKeyPopup from "./column-fk-popup";
import ColumnGeneratingPopup from "./column-generate-popup";
import ColumnTypeSelector from "./column-type-selector";
import ColumnUniquePopup from "./column-unique-popup";
import { SchemaEditorForeignKey } from "./schema-editor-foreign-key";
import { useSchemaEditorContext } from "./schema-editor-prodiver";

export type ColumnChangeEvent = (
  newValue: Partial<DatabaseTableColumn> | null
) => void;

export interface SchemaEditorOptions {
  collations: string[];
}

function changeColumnOnIndex(
  idx: number,
  value: Partial<DatabaseTableColumn> | null,
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>
) {
  onChange((prev) => {
    return produce(prev, (draft) => {
      const currentColumn = draft.columns[idx];
      if (currentColumn.new) {
        currentColumn.new = {
          ...currentColumn.new,
          ...value,
          constraint: value?.constraint
            ? {
                ...currentColumn.new.constraint,
                ...value.constraint,
              }
            : currentColumn.new.constraint,
        };
      }
    });
  });
}

function ColumnItemType({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}) {
  const { suggestion } = useSchemaEditorContext();

  if (suggestion.type === "dropdown" && suggestion.dropdownOptions) {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-inherit border-0 rounded-none shadow-none text-sm">
          <SelectValue placeholder="Select datatype" />
        </SelectTrigger>
        <SelectContent>
          {suggestion.dropdownOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="bg-inherit"
            >
              {option.text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <ColumnTypeSelector
      onChange={onChange}
      value={value}
      suggestions={suggestion.typeSuggestions ?? []}
    />
  );
}

function ColumnItem({
  schema,
  selected,
  onSelectChange,
  idx,
  schemaName,
  onChange,
  disabledEditExistingColumn,
}: {
  selected?: boolean;
  onSelectChange: (selected: boolean) => void;
  schema: DatabaseTableSchemaChange;
  idx: number;
  schemaName?: string;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  disabledEditExistingColumn?: boolean;
}) {
  const value = schema.columns[idx]!;

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id: value.key, disabled: !!value.old });
  const disabled = !!disabledEditExistingColumn && !!value.old;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { collations } = useSchemaEditorContext();

  const supportCollation = collations && collations.length > 0;

  const change = useCallback(
    (newValue: Partial<DatabaseTableColumn> | null) => {
      changeColumnOnIndex(idx, newValue, onChange);
    },
    [idx, onChange]
  );

  const column = value.new || value.old;
  if (!column) return null;

  const isPrimaryKey = schema.constraints.some((constraint) => {
    return (constraint.new ?? constraint.old)?.primaryColumns?.includes(
      column.name
    );
  });

  let rowBackgroundColor = "bg-background";

  if (value.new === null) {
    rowBackgroundColor = "bg-red-100 dark:bg-red-400 dark:text-black";
  } else if (schema.name.old && value.old === null) {
    rowBackgroundColor = "bg-green-100 dark:bg-green-400 dark:text-black";
  } else if (schema.name.old && checkSchemaColumnChange(value)) {
    rowBackgroundColor = "bg-yellow-100 dark:bg-yellow-400 dark:text-black";
  } else if (selected) {
    rowBackgroundColor = "bg-gray-100";
  }

  return (
    <tr
      style={style}
      {...attributes}
      ref={setNodeRef}
      className={rowBackgroundColor}
    >
      <td
        ref={setActivatorNodeRef}
        {...listeners}
        className={cn(
          "border-r border-t border-b text-sm text-center bg-muted font-mono"
        )}
      >
        <div className="flex items-center justify-end gap-1 pr-2">
          {isPrimaryKey ? (
            <Key className="w-4 h-4 text-green-600" weight="duotone" />
          ) : (
            ""
          )}
          {idx + 1}
        </div>
      </td>

      <td
        className={cn("border-t border-b px-2 border-r")}
        onClick={() => onSelectChange(!selected)}
      >
        <div className="h-[38px] flex items-center justify-center">
          <Checkbox checked={selected} />
        </div>
      </td>
      <td className="border-r border-t border-b">
        <input
          value={column.name}
          onChange={(e) => change({ name: e.currentTarget.value })}
          className="p-2 text-sm outline-none w-[150px] bg-inherit font-mono"
          spellCheck={false}
        />
      </td>
      <td className="border">
        <ColumnItemType
          value={column.type}
          onChange={(newType) => {
            change({ type: newType });
          }}
          disabled={disabled}
        />
      </td>
      <td className="border">
        <ColumnDefaultValueInput
          onChange={(constraint: DatabaseTableColumnConstraint) =>
            change({ constraint })
          }
          constraint={column.constraint}
          disabled={disabled}
        />
      </td>
      <td className="border text-center w-[50px]">
        <Checkbox
          disabled={disabled}
          checked={!column.constraint?.notNull}
          onCheckedChange={(nullable: boolean) =>
            change({ constraint: { notNull: !nullable } })
          }
        />
      </td>
      <td className="border px-2">
        <div className="flex gap-2">
          {column.constraint?.unique && (
            <ColumnUniquePopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.checkExpression !== undefined && (
            <ColumnCheckPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.generatedExpression !== undefined && (
            <ColumnGeneratingPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

          {column.constraint?.foreignKey && schemaName && (
            <ColumnForeignKeyPopup
              constraint={column.constraint.foreignKey}
              disabled={disabled}
              onChange={change}
              schemaName={schemaName}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 shadow border rounded">
                <LucidePlus className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Constraint</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({ constraint: { primaryKey: true } });
                }}
              >
                Primary Key
              </DropdownMenuItem>
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({ constraint: { unique: true } });
                }}
              >
                Unique
              </DropdownMenuItem>
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({
                    constraint: {
                      checkExpression: "",
                    },
                  });
                }}
              >
                Check Constraint
              </DropdownMenuItem>
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({
                    constraint: {
                      foreignKey: {},
                    },
                  });
                }}
              >
                Foreign Key
              </DropdownMenuItem>
              <DropdownMenuItem
                inset
                disabled={disabled}
                onClick={() => {
                  change({
                    constraint: {
                      generatedType: "VIRTUAL",
                      generatedExpression: "",
                    },
                  });
                }}
              >
                Virtuality
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
      {supportCollation && (
        <td className="border">
          <ColumnCollation
            value={column.constraint?.collate}
            onChange={(value) => {
              change({
                constraint: {
                  ...column.constraint,
                  collate: value || undefined,
                },
              });
            }}
          />
        </td>
      )}
    </tr>
  );
}

export default function SchemaEditorColumnList({
  value,
  onChange,
  onAddColumn,
  disabledEditExistingColumn,
}: Readonly<{
  value: DatabaseTableSchemaChange;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  onAddColumn: () => void;
  disabledEditExistingColumn?: boolean;
}>) {
  const { showDialog } = useCommonDialog();
  const headerStyle = "text-xs p-2 text-left border-x font-mono";

  const columns = value.columns;
  const schemaName = value.schemaName;

  const { collations } = useSchemaEditorContext();

  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set()
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = columns.findIndex((c) => c.key === active.id);
        const newIndex = columns.findIndex((c) => c.key === over?.id);

        // You cannot change the order of existing column
        if (columns[newIndex].old) return;

        const newColumns = arrayMove(columns, oldIndex, newIndex);

        onChange((prev) => ({
          ...prev,
          columns: newColumns,
        }));
      }
    },
    [columns, onChange]
  );

  const onRemoveColumns = useCallback(() => {
    onChange((prev) => {
      return produce(prev, (draft) => {
        // If it is a new column, we can just remove it without
        // showing the red highlight
        draft.columns = draft.columns.filter((col) => {
          if (selectedColumns.has(col.key) && !col.old) return false;
          return true;
        });

        // If it is an existing column, we need to show the red highlight
        draft.columns.forEach((col) => {
          if (selectedColumns.has(col.key) && col.old) {
            col.new = null;
          }
        });
      });
    });

    setSelectedColumns(new Set());
  }, [selectedColumns, onChange, setSelectedColumns]);

  const onSetPrimaryKey = useCallback(() => {
    onChange((prev) => {
      return produce(prev, (draft) => {
        const selectColumnRefList = draft.columns.filter((c) =>
          selectedColumns.has(c.key)
        );

        // Finding existing primary key constraint
        const existingPrimaryKey = draft.constraints.find(
          (c) => c.new?.primaryKey
        )?.new;

        if (existingPrimaryKey) {
          existingPrimaryKey.primaryColumns =
            existingPrimaryKey.primaryColumns ?? [];

          for (const columnRef of selectColumnRefList) {
            if (
              !existingPrimaryKey.primaryColumns.includes(
                columnRef.new?.name ?? ""
              )
            ) {
              existingPrimaryKey.primaryColumns.push(columnRef.new?.name ?? "");
            }
          }
        } else {
          draft.constraints.push({
            id: window.crypto.randomUUID(),
            old: null,
            new: {
              primaryKey: true,
              primaryColumns: selectColumnRefList.map(
                (c) => c.new?.name ?? c.old?.name ?? ""
              ),
            },
          });
        }
      });
    });

    setSelectedColumns(new Set());
  }, [selectedColumns, onChange, setSelectedColumns]);

  const onSetForeignKey = useCallback(() => {
    showDialog({
      title: "Foreign Key",
      noPadding: true,
      content: (
        <SchemaEditorForeignKey
          selectedColumns={selectedColumns}
          value={columns
            .filter((c) => selectedColumns.has(c.key))
            .map((x) => {
              return {
                old: x.old,
                new: x.new,
                id: x.key,
              };
            })}
        />
      ),
    });
  }, [columns, selectedColumns, showDialog]);

  return (
    <div>
      {collations.length > 0 && (
        <datalist id="collation-list" className="hidden">
          {collations.map((collation) => (
            <option key={collation} value={collation} />
          ))}
        </datalist>
      )}

      <div className="border-b p-1">
        <Toolbar>
          <ToolbarButton
            text="Add Column"
            icon={PlusIcon}
            onClick={onAddColumn}
          />
          <ToolbarButton
            text="Remove Column"
            icon={LucideTrash2}
            destructive
            disabled={selectedColumns.size === 0}
            onClick={onRemoveColumns}
          />
          <ToolbarSeparator />
          <ToolbarButton
            text="Primary Key"
            icon={Key}
            onClick={onSetPrimaryKey}
          />
          <ToolbarButton text="Foreign Key" onClick={onSetForeignKey} />
        </Toolbar>
      </div>

      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <table className="w-full overflow-hidden font-mono text-sm">
          <thead>
            <tr>
              <th className={cn(headerStyle, "bg-muted w-[50px] text-right")}>
                #
              </th>
              <th className={cn(headerStyle, "border-r w-[20px]")}></th>
              <th className={cn(headerStyle, "border-l-0 w-[100px]")}>Name</th>
              <th className={cn(headerStyle, "w-[150px]")}>Type</th>
              <th className={cn(headerStyle, "w-[150px]")}>Default</th>
              <th className={cn(headerStyle, "w-[50px]")}>Null</th>
              <th className={cn(headerStyle)}>Constraint</th>

              {collations.length > 0 && (
                <th className={cn(headerStyle, "w-[160px]")}>Collation</th>
              )}

              {/* <th className={cn(headerStyle, "w-[30px]")}></th> */}
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={columns.map((c) => c.key)}
              strategy={verticalListSortingStrategy}
            >
              {columns.map((col, idx) => (
                <ColumnItem
                  selected={selectedColumns.has(col.key)}
                  onSelectChange={(selected) => {
                    setSelectedColumns((prev) => {
                      if (selected) {
                        prev.add(col.key);
                      } else {
                        prev.delete(col.key);
                      }
                      return new Set(prev);
                    });
                  }}
                  idx={idx}
                  schema={value}
                  key={col.key}
                  onChange={onChange}
                  schemaName={schemaName}
                  disabledEditExistingColumn={disabledEditExistingColumn}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}

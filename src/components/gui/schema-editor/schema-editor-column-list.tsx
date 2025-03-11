import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudioContext } from "@/context/driver-provider";
import {
  DatabaseTableColumn,
  DatabaseTableColumnChange,
  DatabaseTableColumnConstraint,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { checkSchemaColumnChange } from "@/lib/sql/sql-generate.schema";
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
import { LucidePlus, LucideTrash2 } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
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
import ColumnCheckPopup from "./column-check-popup";
import ColumnCollation from "./column-collation";
import ColumnDefaultValueInput from "./column-default-value-input";
import ColumnForeignKeyPopup from "./column-fk-popup";
import ColumnGeneratingPopup from "./column-generate-popup";
import ColumnPrimaryKeyPopup from "./column-pk-popup";
import ColumnTypeSelector from "./column-type-selector";
import ColumnUniquePopup from "./column-unique-popup";

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
    if (prev) {
      const columns = [...(prev?.columns ?? [])];
      const currentCell = columns[idx] as DatabaseTableColumnChange;

      if (currentCell.new) {
        currentCell.new =
          value === null
            ? null
            : {
                ...currentCell.new,
                ...value,
                constraint: value?.constraint
                  ? {
                      ...currentCell.new?.constraint,
                      ...value?.constraint,
                    }
                  : currentCell.new?.constraint,
              };

        if (!currentCell.new && !currentCell.old) {
          // remove the column
          return {
            ...prev,
            columns: columns.filter((_, colIdx) => colIdx !== idx),
          };
        }

        return {
          ...prev,
          columns,
        };
      }
    }
    return prev;
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
  const { databaseDriver } = useStudioContext();

  if (
    databaseDriver.columnTypeSelector.type === "dropdown" &&
    databaseDriver.columnTypeSelector.dropdownOptions
  ) {
    const normalizedValue = databaseDriver.columnTypeSelector.dropdownNormalized
      ? databaseDriver.columnTypeSelector.dropdownNormalized(value) || value
      : value;

    return (
      <Select
        value={normalizedValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="rounded-none border-0 bg-inherit text-sm shadow-none">
          <SelectValue placeholder="Select datatype" />
        </SelectTrigger>
        <SelectContent>
          {databaseDriver.columnTypeSelector.dropdownOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
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
      suggestions={databaseDriver.columnTypeSelector.typeSuggestions ?? []}
    />
  );
}

function ColumnItem({
  value,
  idx,
  schemaName,
  onChange,
  options,
  disabledEditExistingColumn,
}: {
  value: DatabaseTableColumnChange;
  idx: number;
  schemaName?: string;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  disabledEditExistingColumn?: boolean;
  options: SchemaEditorOptions;
}) {
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

  const change = useCallback(
    (newValue: Partial<DatabaseTableColumn> | null) => {
      changeColumnOnIndex(idx, newValue, onChange);
    },
    [idx, onChange]
  );

  const column = value.new || value.old;
  if (!column) return null;

  let highlightClassName = "";
  if (value.new === null) {
    highlightClassName = "bg-red-400 dark:bg-red-800";
  } else if (value.old === null) {
    highlightClassName = "bg-green-500 dark:bg-green-800";
  } else if (checkSchemaColumnChange(value)) {
    highlightClassName = "bg-yellow-400";
  }

  return (
    <tr
      style={style}
      {...attributes}
      ref={setNodeRef}
      className={
        value.new === null
          ? "bg-red-100 dark:bg-red-400 dark:text-black"
          : "bg-background"
      }
    >
      <td
        ref={setActivatorNodeRef}
        {...listeners}
        className={cn("border-t border-b border-l")}
      >
        <div
          className={cn("ml-1 h-[30px] w-[12px] rounded", highlightClassName)}
        ></div>
      </td>
      <td className="border-t border-r border-b">
        <input
          value={column.name}
          onChange={(e) => change({ name: e.currentTarget.value })}
          className="w-[150px] bg-inherit p-2 text-sm outline-hidden"
          spellCheck={false}
        />
      </td>
      <td className="border">
        <ColumnItemType
          value={column.type}
          onChange={(newType) => change({ type: newType })}
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
      <td className="w-[50px] border text-center">
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
          {column.constraint?.primaryKey && (
            <ColumnPrimaryKeyPopup
              constraint={column.constraint}
              disabled={disabled}
              onChange={change}
            />
          )}

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
              <button className="rounded border p-1 shadow-sm">
                <LucidePlus className="h-4 w-4" />
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
      {options.collations.length > 0 && (
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
      <td className="border px-1">
        <button
          className="p-1"
          onClick={() => {
            change(null);
          }}
        >
          <LucideTrash2 className="h-4 w-4 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

export default function SchemaEditorColumnList({
  columns,
  onChange,
  schemaName,
  onAddColumn,
  disabledEditExistingColumn,
  options,
}: Readonly<{
  columns: DatabaseTableColumnChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  schemaName?: string;
  onAddColumn: () => void;
  disabledEditExistingColumn?: boolean;
  options: SchemaEditorOptions;
}>) {
  const headerStyle = "text-xs p-2 text-left bg-secondary border";

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

  const headerCounter = useMemo(() => {
    let initialCounter = 7;
    if (options.collations.length > 0) {
      initialCounter++;
    }

    return initialCounter;
  }, [options]);

  return (
    <div className="p-4">
      {options.collations.length > 0 && (
        <datalist id="collation-list" className="hidden">
          {options.collations.map((collation) => (
            <option key={collation} value={collation} />
          ))}
        </datalist>
      )}

      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <table className="w-full overflow-hidden rounded">
          <thead>
            <tr>
              <td className={cn(headerStyle, "w-[20px]")}></td>
              <th className={cn(headerStyle, "w-[100px]")}>Name</th>
              <th className={cn(headerStyle, "w-[150px]")}>Type</th>
              <th className={cn(headerStyle, "w-[150px]")}>Default</th>
              <th className={cn(headerStyle, "w-[50px]")}>Null</th>
              <th className={cn(headerStyle)}>Constraint</th>

              {options.collations.length > 0 && (
                <th className={cn(headerStyle, "w-[160px]")}>Collation</th>
              )}

              <th className={cn(headerStyle, "w-[30px]")}></th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={columns.map((c) => c.key)}
              strategy={verticalListSortingStrategy}
            >
              {columns.map((col, idx) => (
                <ColumnItem
                  idx={idx}
                  value={col}
                  key={col.key}
                  onChange={onChange}
                  schemaName={schemaName}
                  disabledEditExistingColumn={disabledEditExistingColumn}
                  options={options}
                />
              ))}
            </SortableContext>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={headerCounter} className="border px-4 py-2">
                <Button size="sm" onClick={onAddColumn}>
                  <LucidePlus className="mr-1 h-4 w-4" /> Add Column
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </DndContext>
    </div>
  );
}

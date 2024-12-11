import { Dispatch, SetStateAction, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { LucidePlus, LucideTrash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnDefaultValueInput from "./column-default-value-input";
import { checkSchemaColumnChange } from "@/components/lib/sql-generate.schema";
import {
  DatabaseTableColumn,
  DatabaseTableColumnChange,
  DatabaseTableColumnConstraint,
  DatabaseTableSchemaChange,
} from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import ColumnPrimaryKeyPopup from "./column-pk-popup";
import ColumnUniquePopup from "./column-unique-popup";
import ColumnForeignKeyPopup from "./column-fk-popup";
import ColumnGeneratingPopup from "./column-generate-popup";
import ColumnCheckPopup from "./column-check-popup";
import { Button } from "@/components/ui/button";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useDatabaseDriver } from "@/context/driver-provider";
import ColumnTypeSelector from "./column-type-selector";

export type ColumnChangeEvent = (
  newValue: Partial<DatabaseTableColumn> | null
) => void;

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
  const { databaseDriver } = useDatabaseDriver();

  if (
    databaseDriver.columnTypeSelector.type === "dropdown" &&
    databaseDriver.columnTypeSelector.dropdownOptions
  ) {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-inherit border-0 rounded-none shadow-none text-sm">
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
  disabledEditExistingColumn,
}: {
  value: DatabaseTableColumnChange;
  idx: number;
  schemaName?: string;
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  disabledEditExistingColumn?: boolean;
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
        className={cn("border-l border-t border-b")}
      >
        <div
          className={cn("w-[12px] h-[30px] ml-1 rounded", highlightClassName)}
        ></div>
      </td>
      <td className="border-r border-t border-b">
        <input
          value={column.name}
          onChange={(e) => change({ name: e.currentTarget.value })}
          className="p-2 text-sm outline-none w-[150px] bg-inherit"
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
      <td className="px-1 border">
        <button
          className="p-1"
          onClick={() => {
            change(null);
          }}
        >
          <LucideTrash2 className="w-4 h-4 text-red-500" />
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
}: Readonly<{
  columns: DatabaseTableColumnChange[];
  onChange: Dispatch<SetStateAction<DatabaseTableSchemaChange>>;
  schemaName?: string;
  onAddColumn: () => void;
  disabledEditExistingColumn?: boolean;
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

  return (
    <div className="p-4">
      <table className="w-full rounded overflow-hidden">
        <thead>
          <tr>
            <td className={cn(headerStyle, "w-[20px]")}></td>
            <th className={cn(headerStyle, "w-[100px]")}>Name</th>
            <th className={cn(headerStyle, "w-[150px]")}>Type</th>
            <th className={cn(headerStyle, "w-[150px]")}>Default</th>
            <th className={cn(headerStyle, "w-[50px]")}>Null</th>
            <th className={cn(headerStyle)}>Constraint</th>
            <th className={cn(headerStyle, "w-[30px]")}></th>
          </tr>
        </thead>
        <tbody>
          <DndContext
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
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
                />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="px-4 py-2 border">
              <Button size="sm" onClick={onAddColumn}>
                <LucidePlus className="w-4 h-4 mr-1" /> Add Column
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

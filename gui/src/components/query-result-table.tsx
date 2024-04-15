import GenericCell from "@/components/table-cell/GenericCell";
import NumberCell from "@/components/table-cell/NumberCell";
import TextCell from "@/components/table-cell/TextCell";
import OptimizeTable, {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderWithIndexProps,
} from "@/components/table-optimized";
import OptimizeTableState from "@/components/table-optimized/OptimizeTableState";
import { exportRowsToExcel, exportRowsToSqlInsert } from "@/lib/export-helper";
import { KEY_BINDING } from "@/lib/key-matcher";
import { openContextMenuFromEvent } from "@/messages/open-context-menu";
import {
  LucideChevronDown,
  LucidePin,
  LucidePlus,
  LucideSortAsc,
  LucideSortDesc,
  LucideTrash2,
} from "lucide-react";
import React, { PropsWithChildren, useCallback, useState } from "react";
import {
  ColumnSortOption,
  DatabaseValue,
  TableColumnDataType,
} from "@/drivers/base-driver";
import { useBlockEditor } from "@/contexts/block-editor-provider";
import parseSafeJson from "@/lib/json-safe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { triggerSelectFiles, uploadFile } from "@/lib/file-upload";
import { toast } from "sonner";
import BigNumberCell from "./table-cell/BigNumberCell";
import { useDatabaseDriver } from "@/contexts/driver-provider";

interface ResultTableProps {
  data: OptimizeTableState;
  tableName?: string;
  onSortColumnChange?: (columns: ColumnSortOption[]) => void;
  sortColumns?: ColumnSortOption[];
}

function isBlockNoteString(value: DatabaseValue<string>): boolean {
  if (typeof value !== "string") return false;
  if (!(value.startsWith("{") && value.endsWith("}"))) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedJson = parseSafeJson<any>(value, null);
  if (!parsedJson) return false;

  return parsedJson?.format === "BLOCK_NOTE";
}

function Header({
  children,
  header,
}: PropsWithChildren<{ header: OptimizeTableHeaderWithIndexProps }>) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <div
          className="flex grow items-center px-2"
          onContextMenu={() => {
            setOpen(true);
          }}
        >
          {header.icon ? <div className="mr-2">{header.icon}</div> : null}
          <div className="grow">{header.displayName}</div>
          <LucideChevronDown className="text-mute w-4 h-4 cursor-pointer" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={"w-[300px]"}
        side="bottom"
        align="start"
        sideOffset={0}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ResultTable({
  data,
  tableName,
  onSortColumnChange,
}: ResultTableProps) {
  const [stickyHeaderIndex, setStickHeaderIndex] = useState<number>();
  const { openBlockEditor } = useBlockEditor();
  const { databaseDriver } = useDatabaseDriver();

  console.log("henlooooo");

  const renderHeader = useCallback(
    (header: OptimizeTableHeaderWithIndexProps) => {
      return (
        <Header header={header}>
          <DropdownMenuItem
            onClick={() => {
              setStickHeaderIndex(
                header.index === stickyHeaderIndex ? undefined : header.index
              );
            }}
          >
            <LucidePin className="w-4 h-4 mr-2" />
            Pin Header
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!tableName}
            onClick={() => {
              if (onSortColumnChange) {
                onSortColumnChange([{ columnName: header.name, by: "ASC" }]);
              }
            }}
          >
            <LucideSortAsc className="w-4 h-4 mr-2" />
            Sort A → Z
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!tableName}
            onClick={() => {
              if (onSortColumnChange) {
                onSortColumnChange([{ columnName: header.name, by: "DESC" }]);
              }
            }}
          >
            <LucideSortDesc className="w-4 h-4 mr-2" />
            Sort Z → A
          </DropdownMenuItem>
        </Header>
      );
    },
    [stickyHeaderIndex, tableName, onSortColumnChange]
  );

  const renderCell = useCallback(
    ({ y, x, state, header }: OptimizeTableCellRenderProps) => {
      const isFocus = state.hasFocus(y, x);
      const editMode = isFocus && state.isInEditMode();

      if (header.dataType === TableColumnDataType.TEXT) {
        const value = state.getValue(y, x) as DatabaseValue<string>;
        let editor: "input" | "blocknote" = "input"; // this is default editor

        if (isBlockNoteString(value)) {
          editor = "blocknote";
        }

        return (
          <TextCell
            state={state}
            editor={editor}
            editMode={editMode}
            value={state.getValue(y, x) as DatabaseValue<string>}
            focus={isFocus}
            isChanged={state.hasCellChange(y, x)}
            onChange={(newValue) => {
              state.changeValue(y, x, newValue);
            }}
          />
        );
      } else if (header.dataType === TableColumnDataType.REAL) {
        return (
          <NumberCell
            state={state}
            editMode={editMode}
            value={state.getValue(y, x) as DatabaseValue<number>}
            focus={isFocus}
            isChanged={state.hasCellChange(y, x)}
            onChange={(newValue) => {
              state.changeValue(y, x, newValue);
            }}
          />
        );
      } else if (header.dataType === TableColumnDataType.INTEGER) {
        if (databaseDriver.supportBigInt()) {
          return (
            <BigNumberCell
              state={state}
              editMode={editMode}
              value={state.getValue(y, x) as DatabaseValue<bigint>}
              focus={isFocus}
              isChanged={state.hasCellChange(y, x)}
              onChange={(newValue) => {
                state.changeValue(y, x, newValue);
              }}
            />
          );
        } else {
          return (
            <NumberCell
              state={state}
              editMode={editMode}
              value={state.getValue(y, x) as DatabaseValue<number>}
              focus={isFocus}
              isChanged={state.hasCellChange(y, x)}
              onChange={(newValue) => {
                state.changeValue(y, x, newValue);
              }}
            />
          );
        }
      }

      return <GenericCell value={state.getValue(y, x) as string} />;
    },
    [databaseDriver]
  );

  const onHeaderContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const copyCallback = useCallback((state: OptimizeTableState) => {
    const focus = state.getFocus();
    if (focus) {
      const y = focus.y;
      const x = focus.x;
      window.navigator.clipboard.writeText(state.getValue(y, x) as string);
    }
  }, []);

  const pasteCallback = useCallback((state: OptimizeTableState) => {
    const focus = state.getFocus();
    if (focus) {
      const y = focus.y;
      const x = focus.x;
      window.navigator.clipboard.readText().then((pasteValue) => {
        state.changeValue(y, x, pasteValue);
      });
    }
  }, []);

  const onCellContextMenu = useCallback(
    ({
      state,
      event,
    }: {
      state: OptimizeTableState;
      event: React.MouseEvent;
    }) => {
      const randomUUID = crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hasFocus = !!state.getFocus();

      function setFocusValue(newValue: unknown) {
        const focusCell = state.getFocus();
        if (focusCell) {
          state.changeValue(focusCell.y, focusCell.x, newValue);
        }
      }

      function getFocusValue() {
        const focusCell = state.getFocus();
        if (focusCell) {
          return state.getValue(focusCell.y, focusCell.x);
        }

        return undefined;
      }

      openContextMenuFromEvent([
        {
          title: "Insert Value",
          disabled: !hasFocus,
          subWidth: 200,
          sub: [
            {
              title: <pre>NULL</pre>,
              onClick: () => {
                setFocusValue(null);
              },
            },
            {
              title: <pre>DEFAULT</pre>,
              onClick: () => {
                setFocusValue(undefined);
              },
            },
            { separator: true },
            {
              title: (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Unix Timestamp</span>
                  <span>{timestamp}</span>
                </div>
              ),
              onClick: () => {
                setFocusValue(timestamp);
              },
            },
            { separator: true },
            {
              title: (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">UUID </span>
                  <span>{randomUUID}</span>
                </div>
              ),
              onClick: () => {
                setFocusValue(randomUUID);
              },
            },
          ],
        },
        {
          title: "Edit with Block Editor",
          onClick: () => {
            openBlockEditor({
              initialContent: getFocusValue() as string,
              onSave: setFocusValue,
            });
          },
        },

        {
          title: "Upload File",
          onClick: async () => {
            const files = await triggerSelectFiles();

            if (files.error) return toast.error(files.error.message);

            const file = files.value[0];
            if (!file) return;

            const toastId = toast.loading("Uploading file...");
            const { data, error } = await uploadFile(file);
            if (error)
              return toast.error("Upload failed!", {
                id: toastId,
                description: error.message,
              });

            setFocusValue(data.url);
            return toast.success("File uploaded!", { id: toastId });
          },
        },

        {
          separator: true,
        },
        {
          title: "Copy Cell Value",
          shortcut: KEY_BINDING.copy.toString(),
          onClick: () => {
            copyCallback(state);
          },
        },
        {
          title: "Paste",
          shortcut: KEY_BINDING.paste.toString(),
          onClick: () => {
            pasteCallback(state);
          },
        },
        {
          separator: true,
        },
        {
          title: "Copy Row As",
          sub: [
            {
              title: "Copy as Excel",
              onClick: () => {
                if (state.getSelectedRowCount() > 0) {
                  window.navigator.clipboard.writeText(
                    exportRowsToExcel(state.getSelectedRowsArray())
                  );
                }
              },
            },
            {
              title: "Copy as INSERT SQL",
              onClick: () => {
                const headers = state
                  .getHeaders()
                  .map((column) => column?.name ?? "");

                if (state.getSelectedRowCount() > 0) {
                  window.navigator.clipboard.writeText(
                    exportRowsToSqlInsert(
                      tableName ?? "UnknownTable",
                      headers,
                      state.getSelectedRowsArray()
                    )
                  );
                }
              },
            },
          ],
        },
        { separator: true },
        {
          title: "Insert row",
          icon: LucidePlus,
          onClick: () => {
            data.insertNewRow();
          },
        },
        {
          title: "Delete selected row(s)",
          icon: LucideTrash2,
          onClick: () => {
            data.getSelectedRowIndex().forEach((index) => {
              data.removeRow(index);
            });
          },
        },
      ])(event);
    },
    [data, tableName, copyCallback, pasteCallback, openBlockEditor]
  );

  const onKeyDown = useCallback(
    (state: OptimizeTableState, e: React.KeyboardEvent) => {
      if (state.isInEditMode()) return;

      if (KEY_BINDING.copy.match(e as React.KeyboardEvent<HTMLDivElement>)) {
        copyCallback(state);
      } else if (
        KEY_BINDING.paste.match(e as React.KeyboardEvent<HTMLDivElement>)
      ) {
        pasteCallback(state);
      } else if (e.key === "ArrowRight") {
        const focus = state.getFocus();
        if (focus && focus.x + 1 < state.getHeaderCount()) {
          state.setFocus(focus.y, focus.x + 1);
          state.scrollToFocusCell("right", "top");
        }
      } else if (e.key === "ArrowLeft") {
        const focus = state.getFocus();
        if (focus && focus.x - 1 >= 0) {
          state.setFocus(focus.y, focus.x - 1);
          state.scrollToFocusCell("left", "top");
        }
      } else if (e.key === "ArrowUp") {
        const focus = state.getFocus();
        if (focus && focus.y - 1 >= 0) {
          state.setFocus(focus.y - 1, focus.x);
          state.scrollToFocusCell("left", "top");
        }
      } else if (e.key === "ArrowDown") {
        const focus = state.getFocus();
        if (focus && focus.y + 1 < state.getRowsCount()) {
          state.setFocus(focus.y + 1, focus.x);
          state.scrollToFocusCell("left", "bottom");
        }
      } else if (e.key === "Tab") {
        const focus = state.getFocus();
        if (focus) {
          const colCount = state.getHeaderCount();
          const n = focus.y * colCount + focus.x + 1;
          const x = n % colCount;
          const y = Math.floor(n / colCount);
          if (y >= state.getRowsCount()) return;
          state.setFocus(y, x);
          state.scrollToFocusCell(x === 0 ? "left" : "right", "bottom");
        }
      } else if (e.key === "Enter") {
        state.enterEditMode();
      }

      e.preventDefault();
    },
    [copyCallback, pasteCallback]
  );

  console.log("Herer");

  return (
    <OptimizeTable
      internalState={data}
      onContextMenu={onCellContextMenu}
      onHeaderContextMenu={onHeaderContextMenu}
      stickyHeaderIndex={stickyHeaderIndex}
      renderAhead={20}
      renderHeader={renderHeader}
      renderCell={renderCell}
      rowHeight={35}
      onKeyDown={onKeyDown}
    />
  );
}

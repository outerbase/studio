import { useCallback } from "react";
import { KEY_BINDING } from "@/lib/key-matcher";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { openContextMenuFromEvent } from "@/messages/open-context-menu";
import { useFullEditor } from "../providers/full-editor-provider";
import {
  exportRowsToExcel,
  exportRowsToJson,
  exportRowsToSqlInsert,
} from "@/components/lib/export-helper";
import { LucidePlus, LucideTrash2 } from "lucide-react";
import TableStateActions from "../table-optimized/table-state-actions";

export default function useTableResultContextMenu({
  tableName,
  data,
  copyCallback,
  pasteCallback,
}: {
  tableName?: string;
  data: OptimizeTableState;
  copyCallback: (state: OptimizeTableState) => void;
  pasteCallback: (state: OptimizeTableState) => void;
}) {
  const { openEditor } = useFullEditor();

  return useCallback(
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
          title: "Open With",
          sub: [
            {
              title: "Full Text Editor",
              onClick: () => {
                const focusValue = state.getFocusValue();
                if (typeof focusValue === "string") {
                  openEditor({
                    initialValue: focusValue,
                    format: "text",
                    readOnly: state.getReadOnlyMode(),
                    onCancel: () => {},
                    onSave: (newValue) => {
                      state.setFocusValue(newValue);
                    },
                  });
                }
              },
            },
            {
              title: "JSON Editor",
              onClick: () => {
                const focusValue = state.getFocusValue();
                if (typeof focusValue === "string") {
                  openEditor({
                    initialValue: focusValue,
                    format: "json",
                    readOnly: state.getReadOnlyMode(),
                    onCancel: () => {},
                    onSave: (newValue) => {
                      state.setFocusValue(newValue);
                    },
                  });
                }
              },
            },
          ],
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
              title: "Copy as Json",
              onClick: () => {
                const headers = state
                  .getHeaders()
                  .map((column) => column?.name ?? "");

                if (state.getSelectedRowCount() > 0) {
                  window.navigator.clipboard.writeText(
                    exportRowsToJson(headers, state.getSelectedRowsArray())
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
        ...(state.getReadOnlyMode()
          ? []
          : [
              { separator: true },
              {
                title: "Insert row",
                icon: LucidePlus,
                onClick: () => {
                  data.insertNewRow();
                },
              },
              {
                title: "Duplicate row without keys",
                onClick: () => {
                  TableStateActions.duplicateRowWithoutKey(state);
                },
              },
              {
                title: "Duplicate row with keys",
                onClick: () => {
                  TableStateActions.duplicateRow(state);
                },
              },
              { separator: true },
              {
                title: "Delete selected row(s)",
                icon: LucideTrash2,
                onClick: () => {
                  data.getSelectedRowIndex().forEach((index) => {
                    data.removeRow(index);
                  });
                },
              },
            ]),
      ])(event);
    },
    [data, tableName, copyCallback, pasteCallback, openEditor]
  );
}

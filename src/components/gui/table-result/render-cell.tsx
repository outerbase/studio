import { useCallback } from "react";
import { OptimizeTableCellRenderProps } from "../table-optimized";
import { DatabaseValue, TableColumnDataType } from "@/drivers/base-driver";
import TextCell from "../table-cell/text-cell";
import parseSafeJson from "@/lib/json-safe";
import NumberCell from "../table-cell/number-cell";
import BigNumberCell from "../table-cell/big-number-cell";
import GenericCell from "../table-cell/generic-cell";
import { useDatabaseDriver } from "@/context/driver-provider";

function detectTextEditorType(
  value: DatabaseValue<string>
): "input" | "json" | "text" {
  if (typeof value !== "string") return "input";

  // Check if it is JSON format
  const trimmedText = value.trim();
  if (
    trimmedText.substring(0, 1) === "{" &&
    trimmedText.substring(trimmedText.length - 1) === "}"
  ) {
    if (parseSafeJson(trimmedText, undefined) !== undefined) return "json";
  }

  // Check if it is long string
  if (value.length > 200) return "text";

  // If it is multiple line
  if (value.search(/[\n\r]/) >= 0) return "text";

  return "input";
}

export default function useTableResultCellRenderer() {
  const { databaseDriver } = useDatabaseDriver();

  return useCallback(
    ({ y, x, state, header }: OptimizeTableCellRenderProps) => {
      const isFocus = state.hasFocus(y, x);
      const editMode = isFocus && state.isInEditMode();

      if (header.dataType === TableColumnDataType.TEXT) {
        const value = state.getValue(y, x) as DatabaseValue<string>;
        const editor = detectTextEditorType(value);

        return (
          <TextCell
            header={header}
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
            header={header}
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
              header={header}
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
              header={header}
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

      return (
        <GenericCell value={state.getValue(y, x) as string} header={header} />
      );
    },
    [databaseDriver]
  );
}

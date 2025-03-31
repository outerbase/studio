import BlobCell from "@/components/gui/table-cell/blob-cell";
import { DatabaseValue } from "@/drivers/base-driver";
import parseSafeJson from "@/lib/json-safe";
import { ColumnType } from "@outerbase/sdk-transform";
import BigNumberCell from "../table-cell/big-number-cell";
import GenericCell from "../table-cell/generic-cell";
import NumberCell from "../table-cell/number-cell";
import TextCell from "../table-cell/text-cell";
import { OptimizeTableCellRenderProps } from "../table-optimized";
import { TableHeaderMetadata } from "./type";

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

function determineCellType(value: unknown) {
  if (value === null) return undefined;
  if (typeof value === "bigint") return ColumnType.INTEGER;
  if (typeof value === "number") return ColumnType.REAL;
  if (typeof value === "string") return ColumnType.TEXT;
  if (typeof value === "object") return ColumnType.BLOB;

  return undefined;
}

export default function tableResultCellRenderer({
  y,
  x,
  state,
  header,
  isFocus,
}: OptimizeTableCellRenderProps<TableHeaderMetadata>) {
  const editMode = isFocus && state.isInEditMode();
  const value = state.getValue(y, x);
  const valueType = determineCellType(value);

  switch (valueType ?? header.metadata.type) {
    case ColumnType.INTEGER:
      return (
        <BigNumberCell
          header={header}
          state={state}
          editMode={editMode}
          value={value as DatabaseValue<bigint>}
          valueType={valueType}
          focus={isFocus}
          onChange={(newValue) => {
            state.changeValue(y, x, newValue);
          }}
        />
      );

    case ColumnType.REAL:
      return (
        <NumberCell
          header={header}
          state={state}
          editMode={editMode}
          value={value as DatabaseValue<number>}
          valueType={valueType}
          focus={isFocus}
          onChange={(newValue) => {
            state.changeValue(y, x, newValue);
          }}
        />
      );

    case ColumnType.TEXT:
      return (
        <TextCell
          header={header}
          state={state}
          editor={detectTextEditorType(value as DatabaseValue<string>)}
          editMode={editMode}
          value={value as DatabaseValue<string>}
          valueType={valueType}
          focus={isFocus}
          onChange={(newValue) => {
            state.changeValue(y, x, newValue);
          }}
        />
      );

    case ColumnType.BLOB:
      return (
        <BlobCell
          header={header}
          state={state}
          editMode={editMode}
          valueType={valueType}
          value={value as DatabaseValue<number[]>}
          focus={isFocus}
          onChange={(newValue) => {
            state.changeValue(y, x, newValue);
          }}
        />
      );

    default:
      return <GenericCell value={value as string} header={header} />;
  }
}

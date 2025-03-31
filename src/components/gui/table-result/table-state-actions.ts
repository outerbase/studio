import OptimizeTableState from "../table-optimized/optimize-table-state";
import { TableHeaderMetadata } from "./type";

export default class TableStateActions {
  static duplicateRow(state: OptimizeTableState<TableHeaderMetadata>) {
    const rowIndex = state.getFocus()?.y;
    if (!rowIndex) return;

    const currentRow = state.getRowByIndex(rowIndex);

    if (currentRow) {
      const currentRowData = { ...currentRow.raw, ...currentRow.change };

      // Remove all generated column
      for (const header of state.getHeaders()) {
        if (header.metadata.columnSchema?.constraint?.generatedExpression) {
          delete currentRowData[header.name];
        }
      }

      state.insertNewRow(rowIndex, currentRowData);
    }
  }

  static duplicateRowWithoutKey(
    state: OptimizeTableState<TableHeaderMetadata>
  ) {
    const rowIndex = state.getFocus()?.y;
    if (!rowIndex) return;

    const currentRow = state.getRowByIndex(rowIndex);

    if (currentRow) {
      const currentRowData = { ...currentRow.raw, ...currentRow.change };

      // Remove all generated column
      for (const header of state.getHeaders()) {
        if (
          header.metadata.columnSchema?.constraint?.generatedExpression ||
          header.metadata.isPrimaryKey
        ) {
          delete currentRowData[header.name];
        }
      }

      state.insertNewRow(rowIndex, currentRowData);
    }
  }
}

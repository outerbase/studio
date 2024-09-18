import OptimizeTableState from "./OptimizeTableState";

export default class TableStateActions {
  static duplicateRow(state: OptimizeTableState) {
    const rowIndex = state.getFocus()?.y;
    if (!rowIndex) return;

    const currentRow = state.getRowByIndex(rowIndex);

    if (currentRow) {
      const currentRowData = { ...currentRow.raw, ...currentRow.change };

      // Remove all generated column
      for (const header of state.getHeaders()) {
        if (header.headerData?.constraint?.generatedExpression) {
          delete currentRowData[header.name];
        }
      }

      state.insertNewRow(rowIndex, currentRowData);
    }
  }

  static duplicateRowWithoutKey(state: OptimizeTableState) {
    const rowIndex = state.getFocus()?.y;
    if (!rowIndex) return;

    const currentRow = state.getRowByIndex(rowIndex);

    if (currentRow) {
      const currentRowData = { ...currentRow.raw, ...currentRow.change };

      // Remove all generated column
      for (const header of state.getHeaders()) {
        if (
          header.headerData?.constraint?.generatedExpression ||
          header.isPrimaryKey
        ) {
          delete currentRowData[header.name];
        }
      }

      state.insertNewRow(rowIndex, currentRowData);
    }
  }
}

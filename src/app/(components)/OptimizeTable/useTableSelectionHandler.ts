import { useCallback, useMemo } from 'react';

export default function useTableSelectionHandler({
  newRowsIndex,
  removedRowsIndex,
  onSelectedRowsIndexChanged,
  selectedRowsIndex,
}: {
  newRowsIndex?: number[];
  removedRowsIndex?: number[];
  onSelectedRowsIndexChanged: (selectedRows: number[]) => void;
  selectedRowsIndex: number[];
}) {
  const newRowsIndexSet = useMemo(
    () => new Set(newRowsIndex ?? []),
    [newRowsIndex],
  );

  const removedRowsIndexSet = useMemo(
    () => new Set(removedRowsIndex ?? []),
    [removedRowsIndex],
  );

  const handleRowSelection = useCallback(
    (rowIndex: number, isCtrlKey: boolean, isShiftKey: boolean) => {
      let updatedSelectedRowsIndex: number[] = [];

      if (isCtrlKey) {
        // If CTRL key is pressed, toggle the selection of the clicked row
        if (selectedRowsIndex.includes(rowIndex)) {
          updatedSelectedRowsIndex = selectedRowsIndex.filter(
            (index) => index !== rowIndex,
          );
        } else {
          updatedSelectedRowsIndex = [...selectedRowsIndex, rowIndex];
        }
      } else if (isShiftKey) {
        // If SHIFT key is pressed, select rows from the last selected row to the clicked row
        const lastIndex = selectedRowsIndex[selectedRowsIndex.length - 1];
        const start = Math.min(lastIndex, rowIndex);
        const end = Math.max(lastIndex, rowIndex);

        for (let i = start; i <= end; i++) {
          updatedSelectedRowsIndex.push(i);
        }
      } else {
        updatedSelectedRowsIndex = [rowIndex];
      }

      onSelectedRowsIndexChanged(updatedSelectedRowsIndex);
    },
    [selectedRowsIndex, onSelectedRowsIndexChanged],
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      let rowIndex;

      if (e.target instanceof Element) {
        const row = e.target.closest('tr');
        if (row && row.dataset.row) {
          rowIndex = Number(row.dataset.row);
        }
      }

      if (rowIndex !== null && rowIndex !== undefined) {
        const isCtrlKey = e.ctrlKey || e.metaKey;
        const isShiftKey = e.shiftKey;

        if (e.button === 0) {
          handleRowSelection(rowIndex, isCtrlKey, isShiftKey);
        } else if (selectedRowsIndex.length < 2) {
          handleRowSelection(rowIndex, false, false);
        }
      }
    },
    [handleRowSelection, selectedRowsIndex],
  );

  return { newRowsIndexSet, removedRowsIndexSet, handleRowClick };
}

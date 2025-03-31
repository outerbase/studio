import { selectArrayFromIndexList } from "@/lib/export-helper";
import deepEqual from "deep-equal";
import { OptimizeTableHeaderProps, TableCellDecorator } from ".";

export interface OptimizeTableRowValue {
  raw: Record<string, unknown>;
  change?: Record<string, unknown>;
  changeKey?: number;
  isNewRow?: boolean;
  isRemoved?: boolean;
}

type TableChangeEventCallback = (state: OptimizeTableState) => void;

export interface TableSelectionRange {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default class OptimizeTableState<HeaderMetadata = unknown> {
  protected focus: [number, number] | null = null;
  protected data: OptimizeTableRowValue[] = [];

  // last move is used to track cell where user use arrow key to move on using shift key
  protected lastMove: [number, number] | null = null;

  // Selelection range will be replaced our old selected rows implementation
  // It offers better flexiblity and allow us to implement more features
  protected selectionRanges: TableSelectionRange[] = [];

  // Gutter is a sticky column on the left side of the table
  // We primary use it to display row number at the moment
  public gutterColumnWidth = 40;

  protected headers: OptimizeTableHeaderProps<HeaderMetadata>[] = [];
  public headerRevision = 1;
  protected headerWidth: number[] = [];

  protected editMode = false;
  protected readOnlyMode = false;
  protected container: HTMLDivElement | null = null;

  protected changeCallback: TableChangeEventCallback[] = [];
  protected changeDebounceTimerId: NodeJS.Timeout | null = null;

  protected changeCounter = 1;
  protected changeLogs: Record<number, OptimizeTableRowValue> = {};
  protected sql: string = "";

  constructor(
    headers: OptimizeTableHeaderProps<HeaderMetadata>[],
    data: Record<string, unknown>[]
  ) {
    this.headers = headers;
    this.data = data.map((row) => ({
      raw: row,
    }));
    this.headerWidth = headers.map((h) => h.display.initialSize);
  }

  setReadOnlyMode(readOnly: boolean) {
    this.readOnlyMode = readOnly;
  }

  getReadOnlyMode() {
    return this.readOnlyMode;
  }

  setContainer(div: HTMLDivElement | null) {
    this.container = div;
  }

  // ------------------------------------------------
  // Event Handlers
  // ------------------------------------------------
  addChangeListener(cb: TableChangeEventCallback) {
    this.changeCallback.push(cb);
  }

  removeChangeListener(cb: TableChangeEventCallback) {
    this.changeCallback = this.changeCallback.filter((c) => c !== cb);
  }

  protected broadcastChange(instant?: boolean) {
    if (instant) {
      if (this.changeDebounceTimerId) clearTimeout(this.changeDebounceTimerId);
      this.changeCallback.reverse().forEach((cb) => cb(this));
    }

    if (this.changeDebounceTimerId) return false;
    this.changeDebounceTimerId = setTimeout(() => {
      this.changeDebounceTimerId = null;
      this.changeCallback.reverse().forEach((cb) => cb(this));
    }, 5);

    return true;
  }

  protected mergeSelectionRanges() {
    // Sort ranges to simplify merging
    this.selectionRanges.sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);

    const merged: TableSelectionRange[] = [];
    let isLastMoveMerged = false;

    for (const range of this.selectionRanges) {
      const last = merged[merged.length - 1];
      if (
        last &&
        ((last.y1 === range.y1 &&
          last.y2 === range.y2 &&
          last.x2 + 1 === range.x1) ||
          (last.x1 === range.x1 &&
            last.x2 === range.x2 &&
            last.y2 + 1 === range.y1))
      ) {
        last.x2 = Math.max(last.x2, range.x2);
        last.y2 = Math.max(last.y2, range.y2);
        isLastMoveMerged = true;
      } else {
        merged.push({ ...range });
        isLastMoveMerged = false;
      }
    }
    this.selectionRanges = merged;
    if (isLastMoveMerged) this.mergeSelectionRanges();
  }

  protected splitSelectionRange(
    selection: TableSelectionRange,
    deselection: TableSelectionRange
  ): TableSelectionRange[] {
    const result: TableSelectionRange[] = [];

    if (deselection.y1 > selection.y1) {
      result.push({
        x1: selection.x1,
        y1: selection.y1,
        x2: selection.x2,
        y2: deselection.y1 - 1,
      });
    }

    if (deselection.y2 < selection.y2) {
      result.push({
        x1: selection.x1,
        y1: deselection.y2 + 1,
        x2: selection.x2,
        y2: selection.y2,
      });
    }

    if (deselection.x1 > selection.x1) {
      result.push({
        x1: selection.x1,
        y1: Math.max(selection.y1, deselection.y1),
        x2: deselection.x1 - 1,
        y2: Math.min(selection.y2, deselection.y2),
      });
    }

    if (deselection.x2 < selection.x2) {
      result.push({
        x1: deselection.x2 + 1,
        y1: Math.max(selection.y1, deselection.y1),
        x2: selection.x2,
        y2: Math.min(selection.y2, deselection.y2),
      });
    }
    return result;
  }

  // ------------------------------------------------
  // Handle headers and data
  // ------------------------------------------------
  getHeaders() {
    return this.headers;
  }

  updateHeaderDecorator(
    header: OptimizeTableHeaderProps,
    decorator: TableCellDecorator | undefined
  ) {
    const idx = this.headers.findIndex((h) => h.name === header.name);

    if (idx >= 0) {
      this.headers = this.headers.map((h) => {
        if (h.name === header.name) {
          return {
            ...h,
            decorator,
          };
        }
        return h;
      });

      this.headerRevision++;
      this.broadcastChange();
    }
  }

  getValue(y: number, x: number): unknown {
    const rowChange = this.data[y]?.change;
    if (rowChange) {
      const currentHeaderName = this.headers[x]?.name ?? "";
      if (currentHeaderName in rowChange) {
        return rowChange[currentHeaderName];
      }

      return this.getOriginalValue(y, x);
    }
    return this.getOriginalValue(y, x);
  }

  hasCellChange(y: number, x: number) {
    const changeLog = this.data[y]?.change;
    if (!changeLog) return false;

    const currentHeaderName = this.headers[x]?.name ?? "";
    return currentHeaderName in changeLog;
  }

  getOriginalValue(y: number, x: number): unknown {
    const currentHeaderName = this.headers[x]?.name ?? "";
    return this.data[y]?.raw[currentHeaderName];
  }

  changeValue(y: number, x: number, newValue: unknown) {
    if (this.readOnlyMode) return;
    if (this.headers[x]?.setting.readonly) return;

    const oldValue = this.getOriginalValue(y, x);

    const row = this.data[y];
    const headerName = this.headers[x]?.name ?? "";

    if (!row) return;

    if (deepEqual(oldValue, newValue)) {
      const rowChange = row.change;
      if (rowChange && headerName in rowChange) {
        delete rowChange[headerName];
        if (Object.entries(rowChange).length === 0) {
          if (row.changeKey) {
            delete this.changeLogs[row.changeKey];
            delete row.changeKey;
          }
          delete row.change;
        }
      }
    } else {
      const rowChange = row.change;
      if (rowChange) {
        rowChange[headerName] = newValue;
      } else {
        row.changeKey = ++this.changeCounter;
        row.change = { [headerName]: newValue };
        this.changeLogs[row.changeKey] = row;
      }
    }

    this.broadcastChange();
  }

  getChangedRows() {
    return Object.values(this.changeLogs);
  }

  getRowsCount() {
    return this.data.length;
  }

  getHeaderCount() {
    return this.headers.length;
  }

  discardAllChange() {
    const newRows: OptimizeTableRowValue[] = [];

    for (const row of Object.values(this.changeLogs)) {
      if (row.isNewRow) {
        newRows.push(row);
        delete row.change;
        delete row.changeKey;
        delete row.isNewRow;
      } else {
        delete row.change;
        delete row.changeKey;
        delete row.isRemoved;
      }
    }

    // Remove all new rows
    this.data = this.data.filter((row) => !newRows.includes(row));
    this.changeLogs = {};

    this.broadcastChange(true);
  }

  applyChanges(
    updatedRows: {
      row: OptimizeTableRowValue;
      updated: Record<string, unknown>;
    }[]
  ) {
    const rowChanges = this.getChangedRows();
    const removedRows = rowChanges.filter((row) => row.isRemoved);

    for (const row of rowChanges) {
      const updated = updatedRows.find((updateRow) => updateRow.row === row);
      row.raw = { ...row.raw, ...row.change, ...updated?.updated };
      delete row.changeKey;
      delete row.change;
      delete row.isNewRow;
      delete row.isRemoved;
    }

    if (removedRows.length > 0) {
      this.data = this.data.filter((row) => !removedRows.includes(row));
      // after rows were removed, we need to deselect them
      this.selectionRanges = [];
    }

    this.changeLogs = {};
    this.broadcastChange();
  }

  insertNewRow(index = -1, initialData: Record<string, unknown> = {}) {
    if (index === -1) {
      const focus = this.getFocus();
      if (focus) index = focus.y;
    }

    if (index < 0) index = 0;

    const newRow = {
      isNewRow: true,
      raw: {},
      change: initialData,
      changeKey: ++this.changeCounter,
    };

    this.data.splice(index, 0, newRow);
    this.changeLogs[newRow.changeKey] = newRow;
    this.broadcastChange();
  }

  isNewRow(index: number) {
    return !!this.data[index]?.isNewRow;
  }

  removeRow(index = -1) {
    if (index === -1) {
      // Remove the row at focus
      const focus = this.getFocus();
      if (focus) index = focus.y;
    }

    const row = this.data[index];

    if (row) {
      if (row.isNewRow && row.changeKey) {
        delete this.changeLogs[row.changeKey];
        this.data = this.data.filter((dataRow) => dataRow != row);
      } else {
        row.isRemoved = true;
        if (!row.changeKey) {
          row.change = {};
          row.changeKey = ++this.changeCounter;
          this.changeLogs[row.changeKey] = row;
        }
      }
    }

    this.broadcastChange();
  }

  isRemovedRow(index: number) {
    return !!this.data[index]?.isRemoved;
  }

  getAllRows() {
    return this.data;
  }

  getRowByIndex(idx: number) {
    return this.data[idx];
  }

  getLastMove() {
    return this.lastMove
      ? {
          x: this.lastMove[1],
          y: this.lastMove[0],
        }
      : null;
  }

  setLastMove(y: number, x: number) {
    this.lastMove = [y, x];
  }

  clearLastMove() {
    this.lastMove = null;
  }

  // ------------------------------------------------
  // Handle focus logic
  // ------------------------------------------------
  getFocus(): { x: number; y: number } | null {
    return this.focus
      ? {
          x: this.focus[1],
          y: this.focus[0],
        }
      : null;
  }

  getFocusValue(): unknown {
    const focusCell = this.getFocus();
    if (focusCell) {
      return this.getValue(focusCell.y, focusCell.x);
    }

    return undefined;
  }

  setFocusValue(newValue: unknown) {
    const focusCell = this.getFocus();
    if (focusCell) {
      this.changeValue(focusCell.y, focusCell.x, newValue);
    }
  }

  hasFocus(y: number, x: number): boolean {
    if (!this.focus) return false;
    return this.focus[0] === y && this.focus[1] === x;
  }

  setFocus(y: number, x: number) {
    this.focus = [y, x];
    this.clearLastMove();
    this.broadcastChange();
  }

  isInEditMode() {
    return this.editMode;
  }

  enterEditMode() {
    this.editMode = true;
    this.broadcastChange();
  }

  exitEditMode() {
    this.editMode = false;

    if (this.container) {
      this.container.focus();
    }

    this.broadcastChange();
  }

  clearFocus() {
    this.focus = null;
    this.broadcastChange();
  }

  setHeaderWidth(idx: number, newWidth: number) {
    this.headerWidth[idx] = newWidth;
  }

  getHeaderWidth() {
    return this.headerWidth;
  }

  scrollToCell(
    horizontal: "left" | "right",
    vertical: "top" | "bottom",
    cell: { x: number; y: number }
  ) {
    if (this.container && cell) {
      const cellX = cell.x;
      const cellY = cell.y;
      let cellLeft = 38;
      let cellRight = 0;
      const cellTop = (cellY + 1) * 38;
      const cellBottom = cellTop + 38;

      for (let i = 0; i < cellX; i++) {
        cellLeft += this.headerWidth[i] ?? 0;
      }
      cellRight = cellLeft + (this.headerWidth[cellX] ?? 0);

      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      const containerLeft = this.container.scrollLeft;
      const containerRight = containerLeft + this.container.clientWidth;
      const containerTop = this.container.scrollTop;
      const containerBottom = containerTop + height;

      if (horizontal === "right") {
        if (cellRight - 38 > containerRight) {
          this.container.scrollLeft = Math.max(0, cellRight - width);
        }
      } else {
        if (cellLeft < containerLeft) {
          this.container.scrollLeft = cellLeft;
        }
      }

      if (vertical === "bottom") {
        if (cellBottom > containerBottom) {
          this.container.scrollTop = Math.max(0, cellBottom - height);
        }
      } else {
        if (cellTop - 38 < containerTop) {
          this.container.scrollTop = Math.max(0, cellTop - 38);
        }
      }
    }
  }

  clearSelect() {
    this.selectionRanges = [];
    this.broadcastChange();
  }

  getSelectionRanges() {
    return this.selectionRanges;
  }

  setSelectionRanges(ranges: TableSelectionRange[]) {
    this.selectionRanges = ranges;
    this.broadcastChange();
  }

  getSelectedRowCount() {
    return this.getSelectedRowIndex().length;
  }

  getSelectedRowsArray(): unknown[][] {
    return selectArrayFromIndexList(this.data, this.getSelectedRowIndex()).map(
      (row) => this.headers.map((header) => row.raw[header.name])
    );
  }

  getSelectedRowIndex() {
    const selectedRows = new Set<number>();

    for (const range of this.selectionRanges) {
      for (let i = range.y1; i <= range.y2; i++) {
        selectedRows.add(i);
      }
    }

    return Array.from(selectedRows.values());
  }

  getSelectedColIndex() {
    const selectedCols = new Set<number>();

    for (const range of this.selectionRanges) {
      for (let i = range.x1; i <= range.x2; i++) {
        selectedCols.add(i);
      }
    }

    return Array.from(selectedCols.values());
  }

  isFullSelectionRow(y: number) {
    for (const range of this.selectionRanges) {
      if (
        range.y1 <= y &&
        range.y2 >= y &&
        range.x1 === 0 &&
        range.x2 === this.getHeaderCount() - 1
      )
        return true;
    }
    return false;
  }

  getFullSelectionRowsIndex() {
    const selectedRows = new Set<number>();

    for (const range of this.selectionRanges) {
      if (range.x1 === 0 && range.x2 === this.getHeaderCount() - 1) {
        for (let i = range.y1; i <= range.y2; i++) {
          if (!selectedRows.has(i)) selectedRows.add(i);
        }
      }
    }
    return Array.from(selectedRows.values());
  }

  getFullSelectionColsIndex() {
    const selectedCols = new Set<number>();

    for (const range of this.selectionRanges) {
      if (range.y1 === 0 && range.y2 === this.getRowsCount() - 1) {
        for (let i = range.x1; i <= range.x2; i++) {
          if (!selectedCols.has(i)) selectedCols.add(i);
        }
      }
    }
    return Array.from(selectedCols.values());
  }

  isFullSelectionCol(x: number) {
    for (const range of this.selectionRanges) {
      if (
        range.x1 <= x &&
        range.x2 >= x &&
        range.y1 === 0 &&
        range.y2 === this.getRowsCount() - 1
      )
        return true;
    }
    return false;
  }

  selectRow(y: number) {
    this.selectionRanges = [
      { x1: 0, y1: y, x2: this.headers.length - 1, y2: y },
    ];

    this.broadcastChange();
  }

  selectColumn(x: number) {
    this.selectionRanges = [
      { x1: x, y1: 0, x2: x, y2: this.getRowsCount() - 1 },
    ];

    this.broadcastChange();
  }

  selectCell(y: number, x: number, focus = true) {
    this.selectionRanges = [{ x1: x, y1: y, x2: x, y2: y }];

    if (focus) this.setFocus(y, x);
    else this.broadcastChange();
  }

  selectCellRange(y1: number, x1: number, y2: number, x2: number) {
    this.selectionRanges = [
      {
        x1: Math.min(x1, x2),
        y1: Math.min(y1, y2),
        x2: Math.max(x1, x2),
        y2: Math.max(y1, y2),
      },
    ];
    this.broadcastChange();
  }

  findSelectionRange(range: TableSelectionRange) {
    return this.selectionRanges.findIndex(
      (r) =>
        r.x1 <= range.x1 &&
        r.x2 >= range.x2 &&
        r.y1 <= range.y1 &&
        r.y2 >= range.y2
    );
  }

  addSelectionRange(y1: number, x1: number, y2: number, x2: number) {
    const newRange = {
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
    };

    const selectedRangeIndex = this.findSelectionRange(newRange);
    if (selectedRangeIndex < 0) {
      this.selectionRanges.push(newRange);
      this.mergeSelectionRanges();
    } else {
      const selectedRange = this.selectionRanges[selectedRangeIndex];
      const splitedRanges = this.splitSelectionRange(selectedRange, newRange);
      if (splitedRanges.length >= 0) {
        this.selectionRanges.splice(selectedRangeIndex, 1);
        this.selectionRanges = [...this.selectionRanges, ...splitedRanges];
        this.mergeSelectionRanges();
      }
    }
    this.broadcastChange();
  }

  addSelectionRow(y: number) {
    const newRange = {
      x1: 0,
      y1: y,
      x2: this.headers.length - 1,
      y2: y,
    };

    this.addSelectionRange(newRange.y1, newRange.x1, newRange.y2, newRange.x2);
  }

  addSelectionCol(x: number) {
    const newRange = {
      x1: x,
      y1: 0,
      x2: x,
      y2: this.getRowsCount() - 1,
    };

    this.addSelectionRange(newRange.y1, newRange.x1, newRange.y2, newRange.x2);
  }

  selectRowRange(y1: number, y2: number) {
    const newRange = {
      x1: 0,
      y1: Math.min(y1, y2),
      x2: this.headers.length - 1,
      y2: Math.max(y1, y2),
    };
    this.selectionRanges = [newRange];
    this.broadcastChange();
  }

  selectColRange(x1: number, x2: number) {
    const newRange = {
      x1: Math.min(x1, x2),
      y1: 0,
      x2: Math.max(x1, x2),
      y2: this.getRowsCount() - 1,
    };
    this.selectionRanges = [newRange];
    this.broadcastChange();
  }

  isRowSelected(y: number) {
    for (const range of this.selectionRanges) {
      if (y >= range.y1 && y <= range.y2) return true;
    }
    return false;
  }

  getSelectionRange(y: number, x: number) {
    for (const range of this.selectionRanges) {
      if (y >= range.y1 && y <= range.y2 && x >= range.x1 && x <= range.x2) {
        return range;
      }
    }

    return null;
  }

  getCellStatus(y: number, x: number) {
    const focus = this.getFocus();
    const isFocus = !!focus && focus.y === y && focus.x === x;

    // Finding the selection range
    let isSelected = false;
    let isBorderRight = false;
    let isBorderBottom = false;

    for (const range of this.selectionRanges) {
      if (y >= range.y1 && y <= range.y2) {
        if (x >= range.x1 && x <= range.x2) {
          isSelected = true;
        }

        if (x === range.x2 || x + 1 === range.x1) {
          isBorderRight = true;
        }
      }

      if (x >= range.x1 && x <= range.x2) {
        if (y === range.y2 || y + 1 === range.y1) {
          isBorderBottom = true;
        }
      }
    }

    return { isFocus, isSelected, isBorderBottom, isBorderRight };
  }

  setSql(sql: string) {
    this.sql = sql;
  }
  getSql() {
    return this.sql;
  }
}

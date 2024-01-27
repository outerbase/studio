import { selectArrayFromIndexList } from "@/lib/export-helper";
import { OptimizeTableHeaderProps } from ".";
import * as hrana from "@libsql/hrana-client";
import { DatabaseTableSchema } from "@/drivers/DatabaseDriver";
import { LucideKey } from "lucide-react";

interface OptimizeTableRowValue {
  raw: Record<string, unknown>;
  change?: Record<string, unknown>;
  changeKey?: number;
}

export default class OptimizeTableState {
  protected focus: [number, number] | null = null;
  protected selectedRows = new Set<number>();
  protected data: OptimizeTableRowValue[] = [];
  protected headers: OptimizeTableHeaderProps[] = [];

  protected changeCounter = 1;
  protected changeLogs: Record<number, OptimizeTableRowValue> = {};

  static createFromResult(
    dataResult: hrana.RowsResult,
    schemaResult?: DatabaseTableSchema
  ) {
    return new OptimizeTableState(
      dataResult.columnNames.map((headerName) => {
        return {
          initialSize: 150,
          name: headerName ?? "",
          resizable: true,
          icon: schemaResult?.pk.includes(headerName ?? "") ? (
            <LucideKey className="w-4 h-4 text-red-500" />
          ) : undefined,
        };
      }),
      dataResult.rows
    );
  }

  constructor(
    headers: OptimizeTableHeaderProps[],
    data: Record<string, unknown>[]
  ) {
    this.headers = headers;
    this.data = data.map((row) => ({
      raw: row,
    }));
  }

  // ------------------------------------------------
  // Handle headers and data
  // ------------------------------------------------
  getHeaders() {
    return this.headers;
  }

  getValue(y: number, x: number): unknown {
    const rowChange = this.data[y].change;
    if (rowChange) {
      return rowChange[this.headers[x].name] ?? this.getOriginalValue(y, x);
    }
    return this.getOriginalValue(y, x);
  }

  getOriginalValue(y: number, x: number): unknown {
    return this.data[y].raw[this.headers[x].name];
  }

  changeValue(y: number, x: number, newValue: unknown) {
    const oldValue = this.getOriginalValue(y, x);

    const row = this.data[y];
    const headerName = this.headers[x].name;

    if (oldValue === newValue) {
      const rowChange = row.change;
      if (rowChange && rowChange[headerName]) {
        delete rowChange[headerName];
        if (Object.entries(rowChange).length === 0) {
          if (row.changeKey) {
            delete this.changeLogs[row.changeKey];
            delete row["changeKey"];
          }
          delete row["change"];
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
  }

  getChangedRows() {
    return Object.values(this.changeLogs);
  }

  getRowsCount() {
    return this.data.length;
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

  hasFocus(y: number, x: number): boolean {
    if (!this.focus) return false;
    return this.focus[0] === y && this.focus[1] === x;
  }

  setFocus(y: number, x: number) {
    this.focus = [y, x];
  }

  clearFocus() {
    this.focus = null;
  }

  // ------------------------------------------------
  // Handle select row logic
  // ------------------------------------------------
  clearSelect() {
    this.selectedRows.clear();
  }

  getSelectedRowCount() {
    return this.selectedRows.size;
  }

  getSelectedRowsArray(): unknown[][] {
    return selectArrayFromIndexList(this.data, this.getSelectedRowIndex()).map(
      (row) => this.headers.map((header) => row.raw[header.name])
    );
  }

  getSelectedRowIndex() {
    return Array.from(this.selectedRows.values());
  }

  selectRow(y: number, toggle?: boolean) {
    if (toggle) {
      if (this.selectedRows.has(y)) {
        this.selectedRows.delete(y);
      } else {
        this.selectedRows.add(y);
      }
    } else {
      this.selectedRows.add(y);
    }
  }

  isRowSelected(y: number) {
    return this.selectedRows.has(y);
  }
}

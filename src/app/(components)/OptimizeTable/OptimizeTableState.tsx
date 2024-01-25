import { selectArrayFromIndexList } from "@/lib/export-helper";
import { OptimizeTableHeaderProps } from ".";
import * as hrana from "@libsql/hrana-client";
import { DatabaseTableSchema } from "@/drivers/DatabaseDriver";
import { LucideKey } from "lucide-react";

interface OptimizeTableRowValue {
  raw: Record<string, unknown>;
}

export default class OptimizeTableState {
  protected focus: [number, number] | null = null;
  protected selectedRows = new Set<number>();
  protected data: OptimizeTableRowValue[] = [];
  protected headers: OptimizeTableHeaderProps[] = [];

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
  // Handle data
  // ------------------------------------------------
  getHeaders() {
    return this.headers;
  }

  getValue(y: number, x: number): unknown {
    return this.data[y].raw[this.headers[x].name];
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

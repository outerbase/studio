import {
  buildTableResultHeader,
  BuildTableResultProps,
} from "@/lib/build-table-result";
import OptimizeTableState from "../table-optimized/optimize-table-state";
import { TableHeaderMetadata } from "./type";

export function createTableStateFromResult(props: BuildTableResultProps) {
  const r = new OptimizeTableState<TableHeaderMetadata>(
    buildTableResultHeader(props),
    props.result.rows.map((r) => ({ ...r }))
  );

  if (r.getRowsCount() >= 1000) {
    r.gutterColumnWidth = 50;
  }

  if (r.getRowsCount() >= 10000) {
    r.gutterColumnWidth = 60;
  }

  return r;
}

import { cn } from "@/lib/utils";
import React, { type ReactElement } from "react";
import type { OptimizeTableHeaderWithIndexProps } from ".";
import OptimizeTableState from "./optimize-table-state";
import TableHeaderResizeHandler from "./table-header-resize-handler";

export default function TableHeader({
  idx,
  header,
  onHeaderResize,
  onContextMenu,
  sticky,
  renderHeader,
  state,
}: {
  idx: number;
  sticky: boolean;
  header: OptimizeTableHeaderWithIndexProps;
  state: OptimizeTableState;
  onHeaderResize: (idx: number, newWidth: number) => void;
  onContextMenu?: React.MouseEventHandler;
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps,
    idx: number
  ) => ReactElement;
}) {
  const className = cn(sticky ? "sticky z-30" : undefined, "bg-background");

  return (
    <th
      key={header.name}
      title={header.display.tooltip}
      className={className}
      onContextMenu={onContextMenu}
      style={{
        left: sticky ? state.gutterColumnWidth : undefined,
      }}
    >
      {renderHeader(header, idx)}
      {header.setting.resizable && (
        <TableHeaderResizeHandler idx={idx + 1} onResize={onHeaderResize} />
      )}
    </th>
  );
}

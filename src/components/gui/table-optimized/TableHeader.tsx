import React, { type ReactElement } from "react";
import type { OptimizeTableHeaderWithIndexProps } from ".";
import TableHeaderResizeHandler from "./TableHeaderResizeHandler";
import OptimizeTableState from "./OptimizeTableState";
import { cn } from "@/lib/utils";

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
      title={header.tooltip}
      className={className}
      onContextMenu={onContextMenu}
      style={{
        left: sticky ? state.gutterColumnWidth : undefined,
      }}
    >
      {renderHeader(header, idx)}
      {header.resizable && (
        <TableHeaderResizeHandler idx={idx + 1} onResize={onHeaderResize} />
      )}
    </th>
  );
}

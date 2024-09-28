import React, { type ReactElement } from "react";
import type { OptimizeTableHeaderWithIndexProps } from ".";
import TableHeaderResizeHandler from "./TableHeaderResizeHandler";
import { cn } from "../../lib/utils";

export default function TableHeader({
  idx,
  header,
  onHeaderResize,
  onContextMenu,
  sticky,
  renderHeader,
}: {
  idx: number;
  sticky: boolean;
  header: OptimizeTableHeaderWithIndexProps;
  onHeaderResize: (idx: number, newWidth: number) => void;
  onContextMenu?: React.MouseEventHandler;
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps,
    idx: number
  ) => ReactElement;
}) {
  const className = cn(
    sticky ? "sticky left-0 z-30" : undefined,
    "bg-background"
  );

  return (
    <th
      key={header.name}
      title={header.tooltip}
      className={className}
      onContextMenu={onContextMenu}
    >
      {renderHeader(header, idx)}
      {header.resizable && (
        <TableHeaderResizeHandler idx={idx} onResize={onHeaderResize} />
      )}
    </th>
  );
}

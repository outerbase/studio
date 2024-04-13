import React, { ReactElement } from "react";
import { OptimizeTableHeaderWithIndexProps } from ".";
import TableHeaderResizeHandler from "./TableHeaderResizeHandler";
import styles from "./styles.module.css";
import { cn } from "@/lib/utils";

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
    sticky ? styles.stickyColumn : undefined,
    "dark:bg-gray-900 bg-gray-100"
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

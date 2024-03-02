import React from "react";
import { OptimizeTableHeaderProps } from ".";
import TableHeaderResizeHandler from "./TableHeaderResizeHandler";
import styles from "./styles.module.css";

export default function TableHeader({
  idx,
  header,
  onHeaderResize,
  onContextMenu,
  sticky,
}: {
  idx: number;
  sticky: boolean;
  header: OptimizeTableHeaderProps;
  onHeaderResize: (idx: number, newWidth: number) => void;
  onContextMenu?: React.MouseEventHandler;
}) {
  const className = [
    sticky ? styles.stickyColumn : undefined,
    "dark:bg-gray-900 bg-gray-100",
  ]
    .filter(Boolean)
    .join();

  return (
    <th
      key={header.name}
      title={header.tooltip}
      className={className}
      onContextMenu={onContextMenu}
    >
      {header.icon && (
        <div className={styles.tableHeaderIcon}>{header.icon}</div>
      )}

      <div className={styles.tableCellContent}>{header.name}</div>

      {header.rightIcon && (
        <div className={styles.tableHeaderIcon}>{header.rightIcon}</div>
      )}

      {header.resizable && (
        <TableHeaderResizeHandler idx={idx} onResize={onHeaderResize} />
      )}
    </th>
  );
}

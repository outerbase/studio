import { OptimizeTableHeaderProps } from ".";
import TableHeaderResizeHandler from "./TableHeaderResizeHandler";
import styles from "./styles.module.css";

export default function TableHeader({
  idx,
  header,
  onHeaderResize,
  sticky,
}: {
  idx: number;
  sticky: boolean;
  header: OptimizeTableHeaderProps;
  onHeaderResize: (idx: number, newWidth: number) => void;
}) {
  return (
    <th
      key={header.name}
      title={header.tooltip}
      className={sticky ? styles.stickyColumn : undefined}
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

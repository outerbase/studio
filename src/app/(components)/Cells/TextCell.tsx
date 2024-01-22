import styles from "./styles.module.css";

interface TableCellProps<T = unknown> {
  value: T;
  focus?: boolean;
  onFocus?: () => void;
}

export default function TextCell({
  value,
  onFocus,
  focus,
}: TableCellProps<string>) {
  const className = [styles.cell, focus ? styles.focus : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} onMouseDown={onFocus}>
      {value}
    </div>
  );
}

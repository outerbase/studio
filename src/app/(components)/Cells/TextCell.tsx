import GenericCell from "./GenericCell";
import styles from "./styles.module.css";

interface TableCellProps<T = unknown> {
  value: T;
  focus?: boolean;
  editMode?: boolean;
}

export default function TextCell({
  value,
  focus,
  editMode,
}: TableCellProps<string>) {
  const className = [styles.cell, focus ? styles.focus : null]
    .filter(Boolean)
    .join(" ");

  if (editMode) {
    return (
      <div className={className}>
        <input
          type="text"
          className="w-full h-full outline-none pl-2 pr-2 border-0"
          value={value}
        />
      </div>
    );
  }

  return <GenericCell value={value} focus={focus} />;
}

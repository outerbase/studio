import styles from "./styles.module.css";

interface TableCellProps<T = unknown> {
  value: T;
  focus?: boolean;
  onFocus?: () => void;
}

export default function GenericCell({
  value,
  onFocus,
  focus,
}: TableCellProps<unknown>) {
  const className = [styles.cell, focus ? styles.focus : null, "pl-2 pr-2"]
    .filter(Boolean)
    .join(" ");

  if (value === null) {
    return (
      <div className={className} onMouseDown={onFocus}>
        <span className="text-gray-500">NULL</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className={className} onMouseDown={onFocus}>
        <span className="text-blue-700 block text-right">{value}</span>
      </div>
    );
  }

  if (value instanceof ArrayBuffer) {
    const sliceByte = value.slice(0, 64);
    const base64Text = btoa(
      new Uint8Array(sliceByte).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return (
      <div className={className} onMouseDown={onFocus}>
        <div className="flex">
          <div className="mr-2 justify-center items-center flex-col">
            <span className="bg-blue-500 text-white inline rounded p-1 pl-2 pr-2">
              blob
            </span>
          </div>
          <div className="text-orange-600">{base64Text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} onMouseDown={onFocus}>
      {(value as any).toString()}
    </div>
  );
}

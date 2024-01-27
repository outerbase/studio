import { DatabaseValue } from "@/drivers/DatabaseDriver";
import GenericCell from "./GenericCell";
import styles from "./styles.module.css";
import { useState } from "react";

interface TableCellProps<T = unknown> {
  value: T;
  isChanged?: boolean;
  focus?: boolean;
  onChange?: (newValue: DatabaseValue<string>) => void;
}

export default function TextCell({
  value,
  focus,
  isChanged,
  onChange,
}: TableCellProps<string>) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const className = [
    styles.cell,
    focus ? styles.focus : null,
    isChanged ? styles.change : null,
  ]
    .filter(Boolean)
    .join(" ");

  if (editMode) {
    return (
      <div className={className}>
        <input
          autoFocus
          onBlur={() => {
            if (onChange) onChange(editValue);
            setEditMode(false);
          }}
          onChange={(e) => {
            setEditValue(e.currentTarget.value);
          }}
          type="text"
          className="w-full h-full outline-none pl-2 pr-2 border-0"
          value={editValue}
        />
      </div>
    );
  }

  return (
    <GenericCell
      value={value}
      focus={focus}
      isChanged={isChanged}
      onDoubleClick={() => {
        setEditMode(true);
        setEditValue(value);
      }}
    />
  );
}

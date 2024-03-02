import { DatabaseValue } from "@/drivers/DatabaseDriver";
import { useState, useEffect } from "react";
import GenericCell from "./GenericCell";
import styles from "./styles.module.css";

export interface TableEditableCell<T = unknown> {
  value: DatabaseValue<T>;
  isChanged?: boolean;
  focus?: boolean;
  onChange?: (newValue: DatabaseValue<T>) => void;
  readOnly?: boolean;
}

export default function createEditableCell<T = unknown>({
  toString,
  toValue,
  align,
}: {
  toString: (v: DatabaseValue<T>) => DatabaseValue<string>;
  toValue: (v: DatabaseValue<string>) => DatabaseValue<T>;
  align?: "left" | "right";
}): React.FC<TableEditableCell<T>> {
  return function GenericEditableCell({
    value,
    isChanged,
    focus,
    onChange,
    readOnly,
  }: TableEditableCell<T>) {
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState<DatabaseValue<string>>(
      toString(value)
    );

    useEffect(() => {
      setEditValue(toString(value));
    }, [value]);

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
              if (onChange) onChange(toValue(editValue));
              setEditMode(false);
            }}
            onChange={(e) => {
              setEditValue(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (onChange) onChange(toValue(editValue));
                setEditMode(false);
              } else if (e.key === "Escape") {
                setEditValue(toString(value));
                setEditMode(false);
              }
            }}
            type="text"
            className={
              align === "right"
                ? "bg-background w-full h-full outline-none pl-2 pr-2 border-0 text-right"
                : "bg-background w-full h-full outline-none pl-2 pr-2 border-0"
            }
            value={editValue ?? ""}
          />
        </div>
      );
    }

    return (
      <GenericCell
        value={toValue(editValue)}
        focus={focus}
        isChanged={isChanged}
        onDoubleClick={() => {
          if (!readOnly) {
            setEditMode(true);
          }
        }}
      />
    );
  };
}

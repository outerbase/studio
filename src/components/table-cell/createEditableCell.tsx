import { useState, useEffect, useCallback } from "react";
import GenericCell from "./GenericCell";
import styles from "./styles.module.css";
import { DatabaseValue } from "@/drivers/base-driver";
import { useBlockEditor } from "@/context/block-editor-provider";

export interface TableEditableCell<T = unknown> {
  value: DatabaseValue<T>;
  isChanged?: boolean;
  focus?: boolean;
  onChange?: (newValue: DatabaseValue<T>) => void;
  readOnly?: boolean;
  editor?: "input" | "blocknote";
}

interface TabeEditableCellProps<T = unknown> {
  toString: (v: DatabaseValue<T>) => DatabaseValue<string>;
  toValue: (v: DatabaseValue<string>) => DatabaseValue<T>;
  align?: "left" | "right";
}

function InputCellEditor({
  value,
  align,
  discardChange,
  applyChange,
  onChange,
}: Readonly<{
  align?: "left" | "right";
  applyChange: (v: DatabaseValue<string>) => void;
  discardChange: () => void;
  value: DatabaseValue<string>;
  onChange: (v: string) => void;
}>) {
  return (
    <input
      autoFocus
      onBlur={() => {
        applyChange(value);
      }}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          applyChange(value);
        } else if (e.key === "Escape") {
          discardChange();
        }
      }}
      type="text"
      className={
        align === "right"
          ? "bg-background w-full h-full outline-none pl-2 pr-2 border-0 text-right"
          : "bg-background w-full h-full outline-none pl-2 pr-2 border-0"
      }
      value={value ?? ""}
    />
  );
}

function BlockEditCellEditor({
  value,
  discardChange,
  applyChange,
  onChange,
}: Readonly<{
  align?: "left" | "right";
  applyChange: (v: DatabaseValue<string>) => void;
  discardChange: () => void;
  value: DatabaseValue<string>;
  onChange: (v: string) => void;
}>) {
  const { openBlockEditor, closeBlockEditor } = useBlockEditor();

  useEffect(() => {
    openBlockEditor({
      initialContent: value ?? "",
      onSave: (v) => {
        onChange(v);
        applyChange(v);
      },
      onCancel: discardChange,
    });

    return () => {
      closeBlockEditor();
    };
  }, [
    value,
    openBlockEditor,
    closeBlockEditor,
    applyChange,
    discardChange,
    onChange,
  ]);

  return null;
}

export default function createEditableCell<T = unknown>({
  toString,
  toValue,
  align,
}: TabeEditableCellProps<T>): React.FC<TableEditableCell<T>> {
  return function GenericEditableCell({
    value,
    isChanged,
    focus,
    onChange,
    readOnly,
    editor,
  }: TableEditableCell<T>) {
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState<DatabaseValue<string>>(
      toString(value)
    );

    useEffect(() => {
      setEditValue(toString(value));
    }, [value]);

    const applyChange = useCallback(
      (v: DatabaseValue<string>) => {
        if (onChange) onChange(toValue(v));
        setEditMode(false);
      },
      [onChange, setEditMode]
    );

    const discardChange = useCallback(() => {
      setEditValue(toString(value));
      setEditMode(false);
    }, [setEditValue, setEditMode, value]);

    const className = [
      styles.cell,
      focus ? styles.focus : null,
      isChanged ? styles.change : null,
    ]
      .filter(Boolean)
      .join(" ");

    if (editMode) {
      if (editor === "blocknote") {
        return (
          <div className={className}>
            <BlockEditCellEditor
              align={align}
              applyChange={applyChange}
              discardChange={discardChange}
              onChange={setEditValue}
              value={editValue}
            />
          </div>
        );
      } else {
        return (
          <div className={className}>
            <InputCellEditor
              align={align}
              applyChange={applyChange}
              discardChange={discardChange}
              onChange={setEditValue}
              value={editValue}
            />
          </div>
        );
      }
    }

    return (
      <GenericCell
        value={toValue(editValue)}
        focus={focus}
        isChanged={isChanged}
        align={align}
        onDoubleClick={() => {
          if (!readOnly) {
            setEditMode(true);
          }
        }}
      />
    );
  };
}

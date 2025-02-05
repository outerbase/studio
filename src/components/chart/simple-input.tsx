import React from "react";

interface SimpleInputProps {
  value?: string;
  placeholder?: string;
  onSumit: (v: string) => void;
}

export default function SimpleInput({
  value,
  placeholder,
  onSumit,
}: SimpleInputProps) {
  const [text, setText] = React.useState(value || "");

  return (
    <input
      className="w-full rounded-md border p-2"
      placeholder={placeholder ?? ""}
      value={text ?? ""}
      onChange={(v) => {
        setText(v.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSumit(text);
        }
      }}
    />
  );
}

import React, { useEffect } from "react";
import { Input } from "../orbit/input";

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

  useEffect(() => {
    setText(value || "");
  }, [value]);

  return (
    <Input
      className="h-[36px] w-full rounded-md border p-2"
      placeholder={placeholder ?? ""}
      value={text ?? ""}
      onChange={(v) => {
        setText(v.target.value);
      }}
      size="lg"
      onBlur={() => {
        onSumit(text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSumit(text);
        }
      }}
    />
  );
}

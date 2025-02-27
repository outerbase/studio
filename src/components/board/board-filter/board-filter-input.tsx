import { useEffect, useState } from "react";

interface Props {
  name: string;
  value: string;
  onChange: (v: string) => void;
}

export function BoardFilterInput(props: Props) {
  const [internalValue, setInternalValue] = useState(props.value);

  useEffect(() => {
    setInternalValue(props.value);
  }, [props.value]);

  return (
    <input
      placeholder={`Enter ${props.name}`}
      value={internalValue}
      onChange={(v) => setInternalValue(v.target.value)}
      onBlur={(e) => {
        props.onChange(e.currentTarget.value);
      }}
      className="max-w-14 outline-0"
    />
  );
}

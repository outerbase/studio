"use client";
import React from "react";
import { ButtonGroup, ButtonGroupItem } from "../button-group";

interface SimpleToggleProps {
  values: string[];
  onChange: (v: string) => void;
  selectedValue: string;
}

export default function SimpleToggle({
  values,
  onChange,
  selectedValue,
}: SimpleToggleProps) {
  const [selected, setSelected] = React.useState(selectedValue || values[0]);
  return (
    <ButtonGroup>
      {values.map((value) => (
        <ButtonGroupItem
          key={value}
          onClick={() => {
            setSelected(value);
            onChange(value);
          }}
          selected={value === selected}
        >
          {value}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}

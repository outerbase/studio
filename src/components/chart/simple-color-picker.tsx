"use client";
import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { ThemeColors, THEMES } from "./chart-type";

const presetColors = [
  "#D0021B",
  "#F5A623",
  "#F8E71C",
  "#8B572A",
  "#7ED321",
  "#417505",
  "#BD10E0",
  "#9013FE",
  "#4A90E2",
  "#50E3C2",
];

interface SimpleColorPickerProps {
  selected?: string;
  onChange: (color: string) => void;
  onThemeChange: (theme: ThemeColors) => void;
}

export default function SimpleColorPicker({
  selected,
  onChange,
  onThemeChange,
}: SimpleColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string | "">(
    selected || ""
  );
  useEffect(() => {
    if (selected) {
      setSelectedColor(selected);
    }
  }, [selected]);
  return (
    <div>
      <div className="flex">
        <SketchPicker
          width="255px"
          className="bg-background! shadow-none!"
          disableAlpha
          presetColors={presetColors}
          color={selectedColor}
          onChangeComplete={(color) => {
            setSelectedColor(color.hex);
            onChange(color.hex);
          }}
        />

        <div className="border-l-accent flex flex-col gap-1 border-l-2 p-3">
          {Object.keys(THEMES).map((key) => {
            return (
              <div
                key={key}
                className="flex cursor-pointer items-center gap-1 text-xs"
                onClick={() => {
                  if (key) {
                    onThemeChange(key as ThemeColors);
                  }
                }}
              >
                <div
                  className="mr-2 h-[14px] w-[14px] cursor-pointer rounded-full"
                  style={{
                    background: THEMES[key as ThemeColors].background,
                  }}
                />
                <p>{key}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

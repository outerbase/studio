"use client";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { Button } from "../ui/button";

const presetColors = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#7FFF00", // Chartreuse Green
  "#00FF00", // Green
  "#00FF7F", // Spring Green
  "#00FFFF", // Cyan
  "#007FFF", // Azure
  "#0000FF", // Blue
  "#7F00FF", // Violet
  "#FF00FF", // Magenta
  "#FF007F", // Rose
  "#800000", // Maroon
  "#FF4500", // Orange Red
  "#FFD700", // Gold
  "#808000", // Olive
  "#008000", // Dark Green
  "#008080", // Teal
  "#000080", // Navy
  "#800080", // Purple
  "#8B0000", // Dark Red
  "#FF6347", // Tomato
  "#FFA500", // Orange
  "#FFFFE0", // Light Yellow
  "#ADFF2F", // Green Yellow
  "#32CD32", // Lime Green
  "#40E0D0", // Turquoise
  "#4682B4", // Steel Blue
  "#6A5ACD", // Slate Blue
  "#EE82EE", // Violet
  "#D2691E", // Chocolate
  "#A52A2A", // Brown
];

interface SimpleColorPickerProps {
  selected?: string;
  onChange: (color: string) => void;
}

export default function SimpleColorPicker({
  selected,
  onChange,
}: SimpleColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string>(selected || "");
  return (
    <div>
      <div className="mt-2 shadow-lg">
        <SketchPicker
          disableAlpha
          presetColors={presetColors}
          color={selectedColor}
          onChangeComplete={(color) => {
            setSelectedColor(color.hex);
          }}
        />
      </div>
      <div className="m-2 flex items-center justify-between">
        <p className="text-sm">
          <span className="pr-2.5 font-bold">{selectedColor}</span>
        </p>
        <Button
          onClick={() => {
            onChange(selectedColor);
          }}
          variant="ghost"
        >
          <span className="text-sm">Ok</span>
        </Button>
      </div>
    </div>
  );
}

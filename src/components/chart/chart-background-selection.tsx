import { produce } from "immer";
import { Dispatch, SetStateAction, useMemo } from "react";
import { MenuBar } from "../orbit/menu-bar";
import ChartBackGroundImage from "./chart-background-image";
import { ChartValue } from "./chart-type";
import SimpleInput from "./simple-input";

const PRESET_GRADIENTS = [
  { start: "#0A0A0A", stop: "#171717" },
  { start: "#121212", stop: "#262626" },
  { start: "#404040", stop: "#525252" },
  { start: "#737373", stop: "#A3A3A3" },
  { start: "#D4D4D4", stop: "#E5E5E5" },
  { start: "#FAFAFA", stop: "#FFFFFF" },
  { start: "#655B94", stop: "#8E85B5" },
  { start: "#2C4F5E", stop: "#42788F" },
  { start: "#33A698", stop: "#54CDBD" },
  { start: "#178DE0", stop: "#3ADAFA" },
  { start: "#C05455", stop: "#D58A8B" },
  { start: "#EA8066", stop: "#F1AB9B" },
  { start: "#E7CFC1", stop: "#F1EFE9" },
  { start: "#F5A96D", stop: "#F9D384" },
  { start: "#FFCDE0", stop: "#FEF7FA" },
  { start: "#C5E4FE", stop: "#F5FAFF" },
  { start: "#ADD7FF", stop: "#F4F9FF" },
  { start: "#FFBBDF", stop: "#FFF4F8" },
];

interface ChartBackgroundSelectionProps {
  value: ChartValue;
  setValue: Dispatch<SetStateAction<ChartValue>>;
}

export default function ChartBackgroundSelection({
  value,
  setValue,
}: ChartBackgroundSelectionProps) {
  const gradientSection = useMemo(() => {
    return (
      <div>
        <div className="flex gap-4 space-y-2 pt-4">
          <div>
            <p className="mb-1.5 text-xs font-bold opacity-70">Start Color</p>
            <SimpleInput
              value={value.params.options.gradientStart || ""}
              onSumit={function (v: string): void {
                setValue((prev) => {
                  return produce(prev, (draft) => {
                    draft.params.options.gradientStart = v;
                  });
                });
              }}
            ></SimpleInput>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold opacity-70">Stop Color</p>
            <SimpleInput
              value={value.params.options.gradientStop || ""}
              onSumit={function (v: string): void {
                setValue((prev) => {
                  return produce(prev, (draft) => {
                    draft.params.options.gradientStop = v;
                  });
                });
              }}
            ></SimpleInput>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2 pt-2">
          {PRESET_GRADIENTS.map(({ start, stop }, index) => (
            <div
              key={index}
              className="aspect-square cursor-pointer rounded-lg"
              style={{
                background: `linear-gradient(45deg, ${start}, ${stop})`,
              }}
              onClick={() => {
                setValue((prev) => {
                  return produce(prev, (draft) => {
                    draft.params.options.gradientStart = start;
                    draft.params.options.gradientStop = stop;
                  });
                });
              }}
            />
          ))}
        </div>
      </div>
    );
  }, [setValue, value]);

  const handleBackgroundTypeChange = (v: string): void => {
    setValue((prev) => {
      return produce(prev, (draft) => {
        draft.params.options.backgroundType = v;
      });
    });
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-bold opacity-70">Background</p>
      <div className="flex items-center pt-2">
        <div className="w-[200px]">
          <MenuBar
            size="lg"
            value={value.params.options.backgroundType}
            onChange={handleBackgroundTypeChange}
            items={[
              {
                value: "none",
                content: "None",
              },
              {
                value: "gradient",
                content: "Gradient",
              },
              {
                value: "image",
                content: "Image",
              },
            ]}
          />
        </div>
      </div>
      <div>
        {value.params.options.backgroundType === "gradient" && gradientSection}
        {value.params.options.backgroundType === "image" && (
          <ChartBackGroundImage onChange={setValue} />
        )}
      </div>
    </div>
  );
}

export function capitalizeFirstChar(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

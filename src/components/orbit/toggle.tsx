import { cn } from "@/lib/utils";

type ToggleProps = {
  size?: "sm" | "base" | "lg";
  toggled?: boolean;
  onChange?: (value: boolean) => void;
};

export const Toggle = ({ onChange, size = "base", toggled }: ToggleProps) => {
  return (
    <button
      className={cn(
        "ob-focus interactive dark:bg-neutral-750 bg-neutral-250 cursor-pointer rounded-full border border-transparent p-1 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700",
        {
          "h-5.5 w-8.5": size === "sm",
          "h-6.5 w-10.5": size === "base",
          "h-7.5 w-12.5": size === "lg",
          "dark:hover:bg-neutral-450 bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-500":
            toggled,
        }
      )}
      onClick={() => {
        if (onChange) onChange(!toggled);
      }}
    >
      <div
        className={cn(
          "aspect-square h-full rounded-full bg-white transition-all",
          {
            "translate-x-full": toggled,
          }
        )}
      />
    </button>
  );
};

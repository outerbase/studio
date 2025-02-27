import { cn } from "@/lib/utils";

export type SelectProps = {
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  setValue: (value: string) => void;
  size?: "sm" | "base" | "lg";
  value: string;
};

export const Select = ({
  className,
  options,
  placeholder,
  setValue,
  size = "base",
  value,
}: SelectProps) => {
  return (
    <select
      className={cn(
        "ob-focus ob-btn btn-secondary interactive relative appearance-none truncate bg-no-repeat",
        {
          "ob-size-sm !pr-6.5": size === "sm",
          "ob-size-base !pr-8": size === "base",
          "ob-size-lg !pr-9": size === "lg",
        },
        {
          "!text-muted-foreground": !value,
        },
        className
      )}
      style={{
        backgroundImage: "url(/caret.svg)",
        backgroundPosition: `calc(100% - ${size === "lg" ? "10px" : size === "base" ? "8px" : "6px"}) calc(100% / 2)`,
        backgroundSize:
          size === "lg" ? "16px" : size === "base" ? "14px" : "12px",
      }}
      onChange={(e) => {
        setValue(e.target.value);
        e.target.blur();
      }}
      value={value}
    >
      {placeholder && <option value={""}>{placeholder}</option>}
      {options.map((option, index) => (
        <option value={option.value} key={index}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

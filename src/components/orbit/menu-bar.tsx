import { cn } from "@/lib/utils";

export interface MenuBarItemProps {
  aria?: string;
  content: string | React.ReactNode;
  value: string;
}

const MenuItem = ({
  value: { content, aria },
  selected,
  onClick,
}: {
  value: MenuBarItemProps;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    aria-label={typeof content === "string" ? content : aria}
    className={cn(
      "text-ob-base-200 hover:text-ob-base-300 ob-focus block h-full cursor-pointer rounded-sm border border-transparent px-2 transition-colors",
      {
        "bg-ob-base-100 border-ob-border text-ob-base-300 dark:bg-ob-base-500 dark:border-neutral-700":
          selected,
      }
    )}
    onClick={onClick}
  >
    {content}
  </button>
);

interface MenuBarProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  items: MenuBarItemProps[];
  size?: "sm" | "base" | "lg";
}

export function MenuBar({
  value,
  onChange,
  className,
  items,
  size = "base",
}: MenuBarProps) {
  return (
    <nav
      className={cn(
        "bg-ob-base-300 border-ob-border flex w-max rounded-lg border !p-0.5 transition-colors",
        {
          "ob-size-sm": size === "sm",
          "ob-size-base": size === "base",
          "ob-size-lg": size === "lg",
        },
        className
      )}
    >
      {items.map((item) => (
        <MenuItem
          key={item.value}
          value={item}
          selected={value === item.value}
          onClick={() => {
            if (onChange) onChange(item.value);
          }}
        />
      ))}
    </nav>
  );
}

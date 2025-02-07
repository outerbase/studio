import { cn } from "@/lib/utils";

type MenuItemProps = {
  aria?: string;
  content: string | React.ReactNode;
  onClick: () => void;
  id: number;
};

const MenuItem = ({
  activeItem,
  aria,
  content,
  onClick,
  id,
}: MenuItemProps & { activeItem: number }) => (
  <button
    aria-label={typeof content === "string" ? content : aria}
    className={cn(
      "text-ob-base-200 hover:text-ob-base-300 ob-focus block h-full cursor-pointer rounded-sm border border-transparent px-2 transition-colors",
      {
        "bg-ob-base-100 border-ob-border text-ob-base-300 dark:bg-ob-base-500 dark:border-neutral-700":
          activeItem === id,
      }
    )}
    onClick={onClick}
  >
    {content}
  </button>
);

type MenuBarProps = {
  activeItem: number;
  className?: string;
  items: MenuItemProps[];
  size?: "sm" | "base" | "lg";
};

export const MenuBar = ({
  activeItem,
  className,
  items,
  size = "base",
}: MenuBarProps) => {
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
      {items.map((item, index) => (
        <MenuItem {...item} key={index} activeItem={activeItem} />
      ))}
    </nav>
  );
};

import { Loader } from "@/components/orbit/loader";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType;
  children?: React.ReactNode;
  displayContent?: "items-first" | "items-last"; // used for children of component
  href?: LinkProps["href"];
  loading?: boolean;
  shape?: "base" | "square";
  size?: "sm" | "base" | "lg";
  title?: string | React.ReactNode;
  toggled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export const Button = ({
  as,
  children,
  disabled,
  className,
  displayContent = "items-last",
  href,
  loading,
  shape = "base",
  size = "base",
  title,
  toggled,
  variant = "secondary",
  ...props
}: ButtonProps) => {
  const Component = as ? (as === "link" ? Link : as) : "button";

  return (
    <Component
      className={cn(
        "ob-btn ob-focus interactive flex shrink-0 items-center font-medium select-none",
        {
          "btn-primary btn-shadow": variant === "primary",
          "btn-secondary btn-shadow": variant === "secondary",
          "btn-ghost": variant === "ghost",
          "btn-destructive": variant === "destructive",

          "ob-size-sm gap-1.5": size === "sm",
          "ob-size-base gap-2": size === "base",
          "ob-size-lg gap-2.5": size === "lg",

          square: shape === "square",

          "flex-row-reverse": displayContent === "items-first",

          "ob-disable": disabled,

          toggle: toggled,
        },
        className
      )}
      disabled={disabled || loading}
      href={href}
      {...props}
    >
      {shape !== "square" && title}

      {loading ? (
        <span
          className={cn({
            "w-3": size === "sm",
            "w-3.5": size === "base",
            "w-4": size === "lg",
            "ease-bounce transition-[width] duration-300 starting:w-0":
              !children,
          })}
        >
          <Loader size={size === "sm" ? 12 : 16} />
        </span>
      ) : (
        children
      )}
    </Component>
  );
};

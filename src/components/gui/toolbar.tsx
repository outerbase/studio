import { PropsWithChildren, ReactElement } from "react";
import { buttonVariants } from "../ui/button";
import { LucideLoader } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

export function Toolbar({ children }: PropsWithChildren) {
  return <div className="flex p-1 gap-1">{children}</div>;
}

export function ToolbarSeparator() {
  return (
    <div className="mx-1">
      <Separator orientation="vertical" />
    </div>
  );
}

export function ToolbarButton({
  disabled,
  loading,
  icon,
  onClick,
  badge,
  text,
  tooltip,
  destructive,
}: {
  icon?: ReactElement;
  disabled?: boolean;
  loading?: boolean;
  badge?: string;
  text: string;
  onClick?: () => void;
  tooltip?: ReactElement | string;
  destructive?: boolean;
}) {
  const buttonContent = (
    <button
      className={cn(
        "flex gap-2",
        buttonVariants({ variant: "ghost", size: "sm" }),
        destructive ? "text-red-500 hover:text-red-500" : ""
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <LucideLoader className="w-4 h-4 animate-spin" /> : icon}
      <span>{text}</span>
      {badge && (
        <span
          className={
            "ml-2 bg-red-500 text-white leading-5 w-5 h-5 rounded-full"
          }
          style={{ fontSize: 9 }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

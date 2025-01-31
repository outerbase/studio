import { cn } from "@/lib/utils";
import { LucideLoader } from "lucide-react";
import { PropsWithChildren, ReactElement } from "react";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Toolbar({ children }: PropsWithChildren) {
  return <div className="flex gap-1 p-1">{children}</div>;
}

export function ToolbarSeparator() {
  return (
    <div className="mx-1">
      <Separator orientation="vertical" />
    </div>
  );
}

export function ToolbarFiller() {
  return <div className="flex-1" />;
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
      {loading ? <LucideLoader className="h-4 w-4 animate-spin" /> : icon}
      {text && <span>{text}</span>}
      {badge && (
        <span
          className={
            "ml-2 h-5 w-5 rounded-full bg-red-500 leading-5 text-white"
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

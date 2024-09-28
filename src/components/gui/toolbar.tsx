import { PropsWithChildren, ReactElement } from "react";
import { Button } from "../ui/button";
import { LucideLoader } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Toolbar({ children }: PropsWithChildren) {
  return <div className="flex p-1 gap-1">{children}</div>;
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
    <Button variant={"ghost"} size={"sm"} disabled={disabled} onClick={onClick}>
      {loading ? <LucideLoader className="w-4 h-4 animate-spin mr-2" /> : icon}

      {destructive ? <span className="text-red-500">{text}</span> : text}

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
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger>{buttonContent}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

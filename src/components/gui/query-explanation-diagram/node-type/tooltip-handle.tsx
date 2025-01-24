import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipExplainHandle(props: {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}) {
  if (props.disabled === true) {
    return <>{props.children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{props.children}</TooltipTrigger>
      <TooltipContent>{props.content}</TooltipContent>
    </Tooltip>
  );
}

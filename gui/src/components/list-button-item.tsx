import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export default function ListButtonItem({
  selected,
  text,
  icon: Icon,
  onClick,
}: Readonly<{
  selected?: boolean;
  text: string;
  icon: LucideIcon;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        buttonVariants({
          variant: selected ? "default" : "ghost",
          size: "sm",
        }),
        "justify-start",
        "cursor-pointer"
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </button>
  );
}

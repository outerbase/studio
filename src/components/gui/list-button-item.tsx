import { buttonVariants } from "../ui/button";
import { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function ListButtonItem({
  selected,
  text,
  icon: Icon,
  onClick,
}: Readonly<{
  selected?: boolean;
  text: string;
  icon?: Icon;
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
      {Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : (
        <div className="w-4 h-4 mr-2"></div>
      )}
      {text}
    </button>
  );
}

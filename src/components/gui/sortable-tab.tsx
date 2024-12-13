import { LucideIcon, LucideX } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { WindowTabItemProps } from "./windows-tab";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { ButtonProps } from "../ui/button";
import { CSS } from "../lib/dnd-kit";

interface SortableTabProps {
  tab: WindowTabItemProps;
  selected: boolean;
  index: number;
  tabCount: number;
  onSelectChange: () => void;
  onClose?: () => void;
}

type WindowTabItemButtonProps = ButtonProps & {
  selected?: boolean;
  title: string;
  icon: LucideIcon;
  onClose?: () => void;
  isDragging?: boolean;
  index: number;
};

export const WindowTabItemButton = forwardRef<
  HTMLButtonElement,
  WindowTabItemButtonProps
>(function WindowTabItemButton(props: WindowTabItemButtonProps, ref) {
  const {
    icon: Icon,
    selected,
    title,
    onClose,
    isDragging,
    index,
    ...rest
  } = props;

  return (
    <button
      className={cn(
        "relative h-[40px] border-x text-neutral-500 flex items-center text-left text-xs px-2 min-w-[170px] max-w-[300px] hover:dark:text-white hover:text-black",
        isDragging && "z-20",
        selected
          ? "bg-neutral-50 dark:bg-neutral-950 text-primary"
          : "border-b border-x-transparent",
        index === 0 ? "border-l-0" : ""
      )}
      onAuxClick={({ button }) => button === 1 && onClose && onClose()}
      ref={ref}
      {...rest}
    >
      <Icon className="ml-2 h-4 w-4 shrink-0 grow-0" />
      <div className="line-clamp-1 grow px-2">{title}</div>
      {onClose && (
        <div
          className={cn(
            "rounded hover:bg-neutral-800 hover:text-white w-5 h-5 ml-2 flex justify-center items-center"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
        >
          <LucideX className={cn("w-3 h-3 grow-0 shrink-0")} />
        </div>
      )}

      {!selected && (
        <div className="absolute right-[-1px] top-2 w-[1px] h-6 bg-neutral-800" />
      )}
    </button>
  );
});

export function SortableTab({
  index,
  tab,
  selected,
  onSelectChange,
  onClose,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
    setNodeRef,
  } = useSortable({ id: tab.key });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <WindowTabItemButton
      ref={setNodeRef}
      icon={tab.icon}
      title={tab.title}
      onClick={onSelectChange}
      selected={selected}
      onClose={onClose}
      style={style}
      index={index}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    />
  );
}

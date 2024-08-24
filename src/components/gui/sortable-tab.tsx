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
  onSelectChange: () => void;
  onClose?: () => void;
}

type WindowTabItemButtonProps = ButtonProps & {
  selected?: boolean;
  title: string;
  icon: LucideIcon;
  onClose?: () => void;
  isDragging?: boolean;
};

export const WindowTabItemButton = forwardRef<
  HTMLButtonElement,
  WindowTabItemButtonProps
>(function WindowTabItemButton(props: WindowTabItemButtonProps, ref) {
  const { icon: Icon, selected, title, onClose, isDragging, ...rest } = props;

  return (
    <button
      className={cn(
        "h-9 flex items-center text-left text-xs font-semibold px-2 w-max-[150px] border-x border-t-2 border-t-yellow-500",
        "libsql-window-tab",
        isDragging && "z-20",
        isDragging && !selected && "bg-gray-200 dark:bg-gray-700 rounded-t",
        selected
          ? "border-b-background bg-background rounded-t"
          : "border-t-secondary border-x-secondary opacity-65 hover:opacity-100"
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
            "rounded-full hover:bg-red-600 hover:text-white w-4 h-4 ml-2 flex justify-center items-center",
            "libsql-window-close"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
        >
          <LucideX
            className={cn("w-3 h-3 grow-0 shrink-0", "libsql-window-close")}
          />
        </div>
      )}
    </button>
  );
});

export function SortableTab({
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
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    />
  );
}

import { Button } from "@/components/ui/button";
import { LucideX } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WindowTabItemProps } from "./windows-tab";

interface SortableTabProps {
  tab: WindowTabItemProps;
  selected: boolean;
  onSelectChange: () => void;
  onClose: () => void;
}

export function SortableTab({
  tab,
  selected,
  onSelectChange,
  onClose,
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tab.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      size={"sm"}
      variant={selected ? "default" : "secondary"}
      onClick={onSelectChange}
      {...attributes}
      {...listeners}
    >
      {tab.title}
      <LucideX className="w-4 h-4 ml-2" onClick={onClose} />
    </Button>
  );
}


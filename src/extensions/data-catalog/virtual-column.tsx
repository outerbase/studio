import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Edit3,
  LucideMoreHorizontal,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { VirtualJoinColumn } from "./driver";

interface Props extends VirtualJoinColumn {
  onDeletRelatinship: () => void;
  onEditRelationship: () => void;
}

export default function VirtaulJoinColumn({
  virtualKeyColumn,
  virtualKeySchema,
  virtualKeyTable,
  flags,
  onEditRelationship,
  onDeletRelatinship,
}: Props) {
  const [isActive, setIsActive] = useState<boolean>(flags?.isActive || true);
  return (
    <div
      className={cn(
        "border-accent flex border-t pt-2 pb-2 text-sm",
        isActive ? "opacity-100" : "opacity-50"
      )}
    >
      <Button
        onClick={() => setIsActive(!isActive)}
        size={"icon"}
        variant="ghost"
      >
        {isActive ? (
          <ToggleRightIcon className="text-black dark:text-green-500" />
        ) : (
          <ToggleLeftIcon className="text-gray-400" />
        )}
      </Button>

      <div className="flex w-[150px] items-center p-2">{virtualKeyColumn}</div>
      <div className="flex w-[150px] items-center p-2">{virtualKeySchema}</div>
      <div className="flex w-[150px] items-center p-2">{virtualKeyTable}</div>
      <div className="flex-1" />
      {
        //=================
        // Dropdown menu
        //=================
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <LucideMoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-2">
          <DropdownMenuItem className="gap-5" onClick={onEditRelationship}>
            Edit Relationship
            <div className="flex-1" />
            <Edit3 className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-5" onClick={onDeletRelatinship}>
            Delete Virtual FK
            <div className="flex-1" />
            <Trash className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

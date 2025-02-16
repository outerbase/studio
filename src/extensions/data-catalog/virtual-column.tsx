import { Button } from "@/components/orbit/button";
import { Toggle } from "@/components/orbit/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OuterbaseDataCatalogComment } from "@/outerbase-cloud/api-type";
import { Edit3, LucideMoreHorizontal, Trash } from "lucide-react";
import { useCallback, useState } from "react";

interface Props {
  data: OuterbaseDataCatalogComment;
  onDeletRelatinship: () => void;
  onEditRelationship: () => void;
  onToggleHideFromEzql: (
    column?: OuterbaseDataCatalogComment,
    cb?: () => void,
    isVirtual?: boolean
  ) => void;
}

export default function VirtualJoinColumn({
  data,
  onToggleHideFromEzql,
  onEditRelationship,
  onDeletRelatinship,
}: Props) {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (data.flags) {
      return data?.flags.isActive;
    }
    return true;
  });

  const handleClickToggle = useCallback(() => {
    setIsActive(!isActive);
    onToggleHideFromEzql(
      {
        ...data,
        flags: {
          ...data.flags,
          isActive: !isActive,
        },
      },
      // call me back when you're done
      () => {},
      true
    );
  }, [data, isActive, onToggleHideFromEzql]);

  return (
    <div
      className={cn(
        "border-accent flex items-center border-t pt-2 pb-2",
        isActive ? "opacity-100" : "opacity-50"
      )}
    >
      <Toggle size="sm" toggled={isActive} onChange={handleClickToggle} />

      <div className="flex w-[150px] items-center p-2 text-base">
        Virtual Relationship
      </div>
      <div className="flex w-[150px] items-center p-2 text-base">
        {data.column}
      </div>
      <div className="flex w-[150px] items-center p-2 text-base">
        {data.virtualKeyTable}
      </div>
      <div className="flex w-[150px] items-center p-2 text-base">
        {data.body}
      </div>
      <div className="flex-1" />
      {
        //=================
        // Dropdown menu
        //=================
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="base" variant="ghost">
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

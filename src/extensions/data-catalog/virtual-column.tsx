import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OuterbaseDataCatalogComment } from "@/outerbase-cloud/api-type";
import {
  Edit3,
  LucideMoreHorizontal,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash,
} from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (data.flags) {
      return data?.flags.isActive;
    }
    return true;
  });

  const handleClickToggle = useCallback(() => {
    setIsActive(!isActive);
    setLoading(true);
    onToggleHideFromEzql(
      {
        ...data,
        flags: {
          ...data.flags,
          isActive: !isActive,
        },
      },
      // call me back when finish update column
      () => {
        setLoading(false);
      },
      true
    );
  }, [data]);

  return (
    <div
      className={cn(
        "border-accent flex border-t pt-2 pb-2 text-sm",
        isActive ? "opacity-100" : "opacity-50"
      )}
    >
      <Button
        disabled={loading}
        onClick={handleClickToggle}
        size={"icon"}
        variant="ghost"
      >
        {isActive ? (
          <ToggleRightIcon className="text-black dark:text-green-500" />
        ) : (
          <ToggleLeftIcon className="text-gray-400" />
        )}
      </Button>

      <div className="flex w-[150px] items-center p-2">
        Virtual Relationship
      </div>
      <div className="flex w-[150px] items-center p-2">{data.column}</div>
      <div className="flex w-[150px] items-center p-2">{data.table}</div>
      <div className="flex w-[150px] items-center p-2">{data.body}</div>
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

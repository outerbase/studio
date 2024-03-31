import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { LucidePencil, LucideTrash, LucideUsers } from "lucide-react";
import { useState } from "react";
import {
  SavedConnectionItem,
  CONNECTION_LABEL_COLORS,
  DRIVER_DETAIL,
} from "./saved-connection-storage";
import Link from "next/link";

export default function ConnectionItemCard({
  conn,
  onEdit,
  onRemove,
}: Readonly<{
  conn: SavedConnectionItem;
  onEdit: () => void;
  onRemove: () => void;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <ContextMenu onOpenChange={setOpen}>
      <ContextMenuTrigger
        disabled={!!conn.shared}
        onContextMenu={(e) => {
          if (conn.shared) {
            e.preventDefault();
          }
        }}
      >
        <Link
          className={cn(
            "border rounded w-[285px] flex overflow-hidden hover:border-secondary hover:bg-secondary",
            open ? "border-secondary bg-secondary" : ""
          )}
          href={
            conn.storage === "local"
              ? `/client/s/${conn.driver ?? "turso"}?p=${conn.id}`
              : `/client/r?p=${conn.id}`
          }
        >
          <div
            className={cn(
              "w-2 shrink-0 bg-yellow-300",
              CONNECTION_LABEL_COLORS[conn.label ?? "gray"]
            )}
          />
          <div className="pt-4 shrink-0 ml-3 mr-2">
            <img
              src={DRIVER_DETAIL[conn.driver ?? "turso"].icon}
              alt={DRIVER_DETAIL[conn.driver ?? "turso"].name}
              className="w-9 h-9 rounded-lg"
            />
          </div>
          <div className="p-2">
            <h2 className="line-clamp-1">{conn.name}</h2>
            {conn.shared ? (
              <p className="text-gray-600 text-xs line-clamp-2 h-8 mt-1">
                <LucideUsers className="w-4 h-4 mr-1 inline" />
                Shared by <strong>{conn.shared.sharedBy.name}</strong>
              </p>
            ) : (
              <p className="text-gray-600 text-xs line-clamp-2 h-8">
                {conn.description || <i>No description</i>}
              </p>
            )}
          </div>
        </Link>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>
          <LucidePencil className="w-4 h-4 mr-2" />
          Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRemove}>
          <LucideTrash className="w-4 h-4 mr-2" /> Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

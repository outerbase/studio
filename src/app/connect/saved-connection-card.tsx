import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { LucidePencil, LucideTrash } from "lucide-react";
import { useState } from "react";
import {
  SavedConnectionItem,
  CONNECTION_LABEL_COLORS,
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
      <ContextMenuTrigger>
        <Link
          className={cn(
            "border rounded w-[275px] bg-white flex overflow-hidden hover:border-black hover:bg-gray-100",
            open ? "border-black bg-gray-100" : ""
          )}
          target="_blank"
          href={`/local/${conn.id}`}
        >
          <div
            className={cn(
              "w-2 shrink-0 bg-yellow-300",
              CONNECTION_LABEL_COLORS[conn.label ?? "gray"]
            )}
          />
          <div className="pt-4 shrink-0 ml-3 mr-2">
            <img src="/turso.png" alt="Turso" className="w-6 h-6" />
          </div>
          <div className="p-2">
            <h2 className="line-clamp-1">{conn.name}</h2>
            <p className="text-gray-600 text-xs line-clamp-2 h-8">
              {conn.description ?? ""}
            </p>
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

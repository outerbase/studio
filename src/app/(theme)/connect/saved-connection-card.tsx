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

  const DatabaseIcon = DRIVER_DETAIL[conn.driver ?? "turso"].icon;

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
            "border rounded-lg w-[300px] bg-background flex overflow-hidden hover:bg-zinc-50 dark:hover:bg-zinc-900",
            open ? "border-secondary bg-secondary" : ""
          )}
          href={
            conn.storage === "local"
              ? conn.driver === "sqlite-filehandler"
                ? `/playground/client?s=${conn.id}`
                : `/client/s/${conn.driver ?? "turso"}?p=${conn.id}`
              : `/client/r?p=${conn.id}`
          }
        >
          <div className="py-4 shrink-0 ml-3 mr-2 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-accent flex justify-center items-center rounded">
                <DatabaseIcon className="w-6 h-6 text-accent-foreground" />
              </div>

              <div>
                <div className="line-clamp-1 text-primary">{conn.name}</div>
                <div className="text-xs text-muted-foreground">
                  {DRIVER_DETAIL[conn.driver ?? "turso"].displayName}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div
                className={cn(
                  "w-4 h-4 shrink-0 bg-yellow-300 rounded-full",
                  CONNECTION_LABEL_COLORS[conn.label ?? "gray"]
                )}
              />
              <div className="text-xs line-clamp-1">
                {conn.description || "No description"}
              </div>
            </div>
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

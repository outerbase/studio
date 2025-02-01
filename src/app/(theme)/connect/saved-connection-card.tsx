import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LucidePencil, LucideTrash } from "lucide-react";
import { SavedConnectionItem } from "./saved-connection-storage";

export default function ConnectionItemCard({
  conn,
  onEdit,
  onRemove,
}: Readonly<{
  conn: SavedConnectionItem;
  onEdit: () => void;
  onRemove: () => void;
}>) {
  return (
    <ResourceCard
      href={
        conn.storage === "local"
          ? conn.driver === "sqlite-filehandler"
            ? `/playground/client?s=${conn.id}`
            : `/client/s/${conn.driver ?? "turso"}?p=${conn.id}`
          : `/client/r?p=${conn.id}`
      }
      title={conn.name}
      subtitle={getDatabaseFriendlyName(conn.driver ?? "")}
      color={conn.label === "gray" ? "default" : conn.label}
      icon={getDatabaseIcon(conn.driver ?? "")}
      visual={getDatabaseVisual(conn.driver ?? "")}
    >
      <DropdownMenuItem onClick={onEdit}>
        <LucidePencil className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onRemove}>
        <LucideTrash className="mr-2 h-4 w-4" />
        Remove
      </DropdownMenuItem>
    </ResourceCard>
  );
}

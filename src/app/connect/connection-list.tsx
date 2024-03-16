"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useState } from "react";
import SaveConnection from "./saved-connection";
import {
  CONNECTION_LABEL_COLORS,
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "@/app/connect/saved-connection-storage";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { LucidePencil, LucideTrash } from "lucide-react";
import EditSavedConnection from "./saved-edit-connection";

function ConnectionItemCard({
  conn,
  onEdit,
}: Readonly<{ conn: SavedConnectionItem; onEdit: () => void }>) {
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
        <ContextMenuItem>
          <LucideTrash className="w-4 h-4 mr-2" /> Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function ConnectionList() {
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [editConnection, setEditConnection] = useState<SavedConnectionItem>();
  const [localSavedConns, setlocalSavedConns] = useState(() => {
    return SavedConnectionLocalStorage.getList();
  });

  const onSaveComplete = useCallback(() => {
    setlocalSavedConns(SavedConnectionLocalStorage.getList());
    setShowAddConnection(false);
  }, [setlocalSavedConns, setShowAddConnection]);

  const onEditComplete = useCallback(() => {
    setlocalSavedConns(SavedConnectionLocalStorage.getList());
    setEditConnection(undefined);
  }, [setlocalSavedConns, setEditConnection]);

  if (editConnection) {
    return (
      <EditSavedConnection
        onClose={() => {
          setEditConnection(undefined);
        }}
        id={editConnection.id}
        storage={editConnection.storage}
        onSaveComplete={onEditComplete}
      />
    );
  }

  if (showAddConnection) {
    return (
      <SaveConnection
        onClose={() => setShowAddConnection(false)}
        onSaveComplete={onSaveComplete}
      />
    );
  }

  return (
    <>
      <div className="px-8 py-2 border-b">
        <Button
          variant={"ghost"}
          onClick={() => {
            setShowAddConnection(true);
          }}
        >
          New Connection
        </Button>

        <Button variant={"ghost"}>Quick Connect</Button>
      </div>

      <div className="flex flex-wrap gap-4 p-4">
        {localSavedConns.map((conn) => {
          return (
            <ConnectionItemCard
              key={conn.id}
              conn={conn}
              onEdit={() => {
                setEditConnection(conn);
              }}
            />
          );
        })}
      </div>
    </>
  );
}

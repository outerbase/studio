"use client";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import SaveConnection from "./saved-connection";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "@/app/connect/saved-connection-storage";
import EditSavedConnection from "./saved-edit-connection";
import RemoveSavedConnection from "./saved-remove-connection";
import ConnectionItemCard from "./saved-connection-card";

export default function ConnectionList() {
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [removeConnection, setRemoveConnection] =
    useState<SavedConnectionItem>();
  const [editConnection, setEditConnection] = useState<SavedConnectionItem>();
  const [localSavedConns, setLocalSavedConns] = useState<SavedConnectionItem[]>(
    []
  );

  useEffect(() => {
    setLocalSavedConns(SavedConnectionLocalStorage.getList());
  }, [setLocalSavedConns]);

  // ---------------------------------------------
  // Remove the connection handlers
  // ---------------------------------------------
  const onRemoveConnectionClose = useCallback(() => {
    setRemoveConnection(undefined);
  }, [setRemoveConnection]);

  const onRemoveConnectionComplete = useCallback(
    (conn: SavedConnectionItem) => {
      if (conn.storage === "local_storage") {
        setLocalSavedConns(SavedConnectionLocalStorage.getList());
        onRemoveConnectionClose();
      }
    },
    [setLocalSavedConns, onRemoveConnectionClose]
  );

  // ---------------------------------------------
  // Add new connection handlers
  // ---------------------------------------------
  const onSaveComplete = useCallback(() => {
    setLocalSavedConns(SavedConnectionLocalStorage.getList());
    setShowAddConnection(false);
  }, [setLocalSavedConns, setShowAddConnection]);

  // ---------------------------------------------
  // Edit connection handlers
  // ---------------------------------------------
  const onEditComplete = useCallback(() => {
    setLocalSavedConns(SavedConnectionLocalStorage.getList());
    setEditConnection(undefined);
  }, [setLocalSavedConns, setEditConnection]);

  // ---------------------------------------------
  // Display Part
  // ---------------------------------------------
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

      {removeConnection && (
        <RemoveSavedConnection
          conn={removeConnection}
          onClose={onRemoveConnectionClose}
          onRemove={onRemoveConnectionComplete}
        />
      )}

      <div className="flex flex-wrap gap-4 p-4">
        {localSavedConns.map((conn) => {
          return (
            <ConnectionItemCard
              key={conn.id}
              conn={conn}
              onRemove={() => {
                setRemoveConnection(conn);
              }}
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

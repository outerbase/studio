"use client";
import { Button } from "@/components/ui/button";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SaveConnection from "./saved-connection";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
  SupportedDriver,
} from "@/app/connect/saved-connection-storage";
import EditSavedConnection from "./saved-edit-connection";
import RemoveSavedConnection from "./saved-remove-connection";
import ConnectionItemCard from "./saved-connection-card";
import { getDatabases } from "@/lib/api/fetch-databases";
import { User } from "lucia";
import QuickConnect from "./quick-connect";
import { LucideChevronDown } from "lucide-react";
import DriverDropdown from "./driver-dropdown";

function ConnectionListSection({
  data,
  name,
  onRemove,
  onEdit,
}: Readonly<{
  data: SavedConnectionItem[];
  name?: string;
  onRemove: Dispatch<SetStateAction<SavedConnectionItem | undefined>>;
  onEdit: Dispatch<SetStateAction<SavedConnectionItem | undefined>>;
}>) {
  const body = useMemo(() => {
    if (data.length === 0)
      return (
        <div className="p-4">
          There is no connection. Please add new connection
        </div>
      );

    return (
      <div className="flex flex-wrap gap-4 p-4">
        {data.map((conn) => {
          return (
            <ConnectionItemCard
              key={conn.id}
              conn={conn}
              onRemove={() => {
                onRemove(conn);
              }}
              onEdit={() => {
                onEdit(conn);
              }}
            />
          );
        })}
      </div>
    );
  }, [data, onRemove, onEdit]);

  return (
    <>
      {name && <h2 className="mt-4 ml-4 font-bold">{name}</h2>}
      {body}
    </>
  );
}

export default function ConnectionList({
  user,
}: Readonly<{ user: User | null }>) {
  const [quickConnect, setQuickConnect] = useState<SupportedDriver | null>(
    null
  );
  const [showAddConnection, setShowAddConnection] =
    useState<SupportedDriver | null>(null);
  const [removeConnection, setRemoveConnection] =
    useState<SavedConnectionItem>();
  const [editConnection, setEditConnection] = useState<SavedConnectionItem>();
  const [localSavedConns, setLocalSavedConns] = useState<SavedConnectionItem[]>(
    []
  );

  const [remoteSavedConns, setRemoteSavedConns] = useState<
    SavedConnectionItem[]
  >([]);

  useEffect(() => {
    setLocalSavedConns(SavedConnectionLocalStorage.getList());
    if (user) getDatabases().then((r) => setRemoteSavedConns(r.databases));
  }, [setLocalSavedConns, setRemoteSavedConns, user]);

  // ---------------------------------------------
  // Remove the connection handlers
  // ---------------------------------------------
  const onRemoveConnectionClose = useCallback(() => {
    setRemoveConnection(undefined);
  }, [setRemoveConnection]);

  const onRemoveConnectionComplete = useCallback(
    (conn: SavedConnectionItem) => {
      if (conn.storage === "local") {
        setLocalSavedConns(SavedConnectionLocalStorage.getList());
      } else {
        setRemoteSavedConns((prev) => prev.filter((r) => r.id !== conn.id));
      }

      onRemoveConnectionClose();
    },
    [setLocalSavedConns, onRemoveConnectionClose, setRemoteSavedConns]
  );

  // ---------------------------------------------
  // Add new connection handlers
  // ---------------------------------------------
  const onSaveComplete = useCallback(
    (savedConn: SavedConnectionItem) => {
      if (savedConn.storage === "remote") {
        setRemoteSavedConns((prev) => [savedConn, ...prev]);
      } else {
        setLocalSavedConns(SavedConnectionLocalStorage.getList());
      }
      setShowAddConnection(null);
    },
    [setLocalSavedConns, setRemoteSavedConns, setShowAddConnection]
  );

  // ---------------------------------------------
  // Edit connection handlers
  // ---------------------------------------------
  const onEditComplete = useCallback(
    (savedConn: SavedConnectionItem) => {
      if (savedConn.storage === "remote") {
        setRemoteSavedConns((prev) =>
          prev.map((r) => {
            if (r.id === savedConn.id) return savedConn;
            return r;
          })
        );
      } else {
        setLocalSavedConns(SavedConnectionLocalStorage.getList());
      }

      setEditConnection(undefined);
    },
    [setLocalSavedConns, setEditConnection, setRemoteSavedConns]
  );

  // ---------------------------------------------
  // Display Part
  // ---------------------------------------------
  if (editConnection) {
    return (
      <EditSavedConnection
        onClose={() => {
          setEditConnection(undefined);
        }}
        conn={editConnection}
        storage={editConnection.storage}
        onSaveComplete={onEditComplete}
      />
    );
  }

  if (showAddConnection) {
    return (
      <SaveConnection
        driver={showAddConnection}
        user={user}
        onClose={() => setShowAddConnection(null)}
        onSaveComplete={onSaveComplete}
      />
    );
  }

  if (quickConnect) {
    return (
      <QuickConnect
        driver={quickConnect}
        onClose={() => setQuickConnect(null)}
      />
    );
  }

  return (
    <>
      <div className="px-8 py-2 border-b">
        <DriverDropdown onSelect={setShowAddConnection}>
          <Button variant={"ghost"}>
            New Connection
            <LucideChevronDown className="ml-2 w-4 h-4" />
          </Button>
        </DriverDropdown>

        <DriverDropdown onSelect={setQuickConnect}>
          <Button variant={"ghost"}>Quick Connect</Button>
        </DriverDropdown>
      </div>

      {removeConnection && (
        <RemoveSavedConnection
          conn={removeConnection}
          onClose={onRemoveConnectionClose}
          onRemove={onRemoveConnectionComplete}
        />
      )}

      <ConnectionListSection
        name="Local"
        data={localSavedConns}
        onRemove={setRemoveConnection}
        onEdit={setEditConnection}
      />

      {user && (
        <ConnectionListSection
          name="Remote"
          data={remoteSavedConns}
          onRemove={setRemoveConnection}
          onEdit={setEditConnection}
        />
      )}
    </>
  );
}

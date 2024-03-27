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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LucideChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  const [quickConnect, setQuickConnect] = useState(false);
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
        id={editConnection.id}
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
    return <QuickConnect onClose={() => setQuickConnect(false)} />;
  }

  return (
    <>
      <div className="px-8 py-2 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"}>
              New Connection
              <LucideChevronDown className="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]">
            <DropdownMenuItem
              onClick={() => {
                setShowAddConnection("turso");
              }}
            >
              <div className="flex gap-4 px-2 items-center h-12">
                <img
                  src="/turso.jpeg"
                  alt="turso"
                  className="w-9 h-9 rounded-lg"
                />
                <div>
                  <div className="font-bold">Turso</div>
                  <div className="text-xs opacity-50">SQLite for Product</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setShowAddConnection("rqlite");
              }}
            >
              <div className="flex gap-4 px-2 items-center h-12">
                <img src="/rqlite.png" alt="turso" className="w-9 h-9" />
                <div>
                  <div className="font-bold">Rqlite</div>
                  <div className="text-xs opacity-50">
                    Distributed database built on SQLite
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem disabled>
              <div className="flex gap-4 px-2 items-center h-12 grayscale">
                <img src="/rqlite.png" alt="turso" className="w-8 h-8" />
                <div>
                  <div className="font-bold">PlanetScale</div>
                  <div className="text-xs">Coming Soon on v0.4.0</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <div className="flex gap-4 px-2 items-center h-12 grayscale">
                <img src="/rqlite.png" alt="turso" className="w-8 h-8" />
                <div>
                  <div className="font-bold">Neon</div>
                  <div className="text-xs">Coming Soon on v0.4.0</div>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={"ghost"}
          onClick={() => {
            setQuickConnect(true);
          }}
        >
          Quick Connect
        </Button>
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

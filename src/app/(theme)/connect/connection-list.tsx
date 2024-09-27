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
} from "@/app/(theme)/connect/saved-connection-storage";
import EditSavedConnection from "./saved-edit-connection";
import RemoveSavedConnection from "./saved-remove-connection";
import ConnectionItemCard from "./saved-connection-card";
import { getDatabases } from "@/lib/api/fetch-databases";
import { User } from "lucia";
import QuickConnect from "./quick-connect";
import { LucideChevronDown, LucideSearch } from "lucide-react";
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
      <div className="flex flex-wrap gap-4 mt-8">
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
      {/* {name && <h2 className="my-4 font-semibold text-primary">{name}</h2>} */}
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

  let dialogComponent: JSX.Element | null = null;

  // ---------------------------------------------
  // Display Part
  // ---------------------------------------------
  if (editConnection) {
    dialogComponent = (
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
    dialogComponent = (
      <SaveConnection
        driver={showAddConnection}
        user={user}
        onClose={() => setShowAddConnection(null)}
        onSaveComplete={onSaveComplete}
      />
    );
  }

  if (quickConnect) {
    dialogComponent = (
      <QuickConnect
        driver={quickConnect}
        onClose={() => setQuickConnect(null)}
      />
    );
  }

  if (removeConnection) {
    dialogComponent = (
      <RemoveSavedConnection
        conn={removeConnection}
        onClose={onRemoveConnectionClose}
        onRemove={onRemoveConnectionComplete}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 max-w-[1000px] mx-auto">
      <div className="flex mt-12 gap-2">
        <h1 className="flex-1 flex items-center font-semibold text-xl text-primary">
          Bases
        </h1>

        <div>
          <div className="border rounded overflow-hidden flex items-center grow mx-2 bg-background">
            <div className="text-sm px-2 h-full flex items-center">
              <LucideSearch className="h-4 w-4 text-black dark:text-white" />
            </div>
            <input
              type="text"
              className="bg-inherit p-2 pl-2 pr-2 outline-none text-sm  h-full grow"
              placeholder="Search base name"
            />
          </div>
        </div>

        <DriverDropdown onSelect={setShowAddConnection}>
          <Button variant={"default"}>
            New Connection
            <LucideChevronDown className="ml-2 w-4 h-4" />
          </Button>
        </DriverDropdown>

        <DriverDropdown onSelect={setQuickConnect}>
          <Button variant={"secondary"}>Quick Connect</Button>
        </DriverDropdown>
      </div>

      {dialogComponent}

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
    </div>
  );
}

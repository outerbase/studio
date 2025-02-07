"use client";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
  SupportedDriver,
} from "@/app/(theme)/connect/saved-connection-storage";
import { Button } from "@/components/ui/button";
import { getDatabases } from "@/lib/api/fetch-databases";
import { cn } from "@/lib/utils";
import { User } from "lucia";
import { LucideChevronDown, LucideSearch } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import DriverDropdown from "./driver-dropdown";
import QuickConnect from "./quick-connect";
import SaveConnection from "./saved-connection";
import ConnectionItemCard from "./saved-connection-card";
import EditSavedConnection from "./saved-edit-connection";
import RemoveSavedConnection from "./saved-remove-connection";

function ConnectionListSection({
  data,
  name,
  search,
  onRemove,
  onEdit,
}: Readonly<{
  search: string;
  data: SavedConnectionItem[];
  name?: string;
  onRemove: Dispatch<SetStateAction<SavedConnectionItem | undefined>>;
  onEdit: Dispatch<SetStateAction<SavedConnectionItem | undefined>>;
}>) {
  const body = useMemo(() => {
    const filteredData = data.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filteredData.length === 0)
      return (
        <div className="py-4 text-sm">
          {search
            ? `There is no record with '${search}'`
            : "There is no base. Please add new base"}
        </div>
      );

    return (
      <div className={cn("flex flex-wrap gap-4", name ? "mt-4" : "mt-8")}>
        {filteredData.map((conn) => {
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
  }, [name, data, search, onRemove, onEdit]);

  return (
    <>
      {name && (
        <h2 className="text-primary mt-4 text-sm font-semibold">{name}</h2>
      )}
      {body}
    </>
  );
}

export default function ConnectionList({
  user,
}: Readonly<{ user: User | null }>) {
  const [search, setSearch] = useState("");
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
    <div className="mx-auto flex max-w-[1000px] flex-1 flex-col pb-12">
      <div className="mt-12 flex gap-2">
        <h1 className="text-primary flex flex-1 items-center text-xl font-semibold">
          Bases
        </h1>

        <div>
          <div className="bg-background mx-2 flex grow items-center overflow-hidden rounded border">
            <div className="flex h-full items-center px-2 text-sm">
              <LucideSearch className="h-4 w-4 text-black dark:text-white" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              type="text"
              className="h-full grow bg-inherit p-2 pr-2 pl-2 text-sm outline-hidden"
              placeholder="Search base name"
            />
          </div>
        </div>

        <DriverDropdown onSelect={setShowAddConnection}>
          <Button variant={"default"}>
            New Connection
            <LucideChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DriverDropdown>

        <DriverDropdown onSelect={setQuickConnect}>
          <Button variant={"secondary"}>Quick Connect</Button>
        </DriverDropdown>
      </div>

      {dialogComponent}

      <ConnectionListSection
        name={user ? "Local" : ""}
        search={search}
        data={localSavedConns}
        onRemove={setRemoveConnection}
        onEdit={setEditConnection}
      />

      {user && (
        <ConnectionListSection
          search={search}
          name="Remote"
          data={remoteSavedConns}
          onRemove={setRemoveConnection}
          onEdit={setEditConnection}
        />
      )}
    </div>
  );
}

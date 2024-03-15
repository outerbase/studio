"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useState } from "react";
// import ConnectionDialog from "./connection-dialog";
import SaveConnection from "./saved-connection";
import {
  CONNECTION_LABEL_COLORS,
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "@/app/connect/saved-connection-storage";
import { cn } from "@/lib/utils";

function ConnectionItemCard({ conn }: Readonly<{ conn: SavedConnectionItem }>) {
  return (
    <Link
      className="border rounded w-[275px] bg-white flex overflow-hidden hover:border-black hover:bg-gray-100"
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
  );
}

export default function ConnectionList() {
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [localSavedConns, setlocalSavedConns] = useState(() => {
    return SavedConnectionLocalStorage.getList();
  });

  const onSaveComplete = useCallback(() => {
    setlocalSavedConns(SavedConnectionLocalStorage.getList());
    setShowAddConnection(false);
  }, [setlocalSavedConns]);

  if (showAddConnection) {
    return <SaveConnection onSaveComplete={onSaveComplete} />;
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
          Add Connection
        </Button>
      </div>

      {/* <h2 className="px-4 font-bold mt-4">Remote</h2> */}
      {/* <div className="flex flex-wrap gap-4 p-4">
        <ConnectionItemCard />
        <ConnectionItemCard />
        <ConnectionItemCard />
        <ConnectionItemCard />
        <ConnectionItemCard />
      </div> */}

      {/* <h2 className="px-4 font-bold mt-4">Local</h2> */}
      <div className="flex flex-wrap gap-4 p-4">
        {localSavedConns.map((conn) => {
          return <ConnectionItemCard key={conn.id} conn={conn} />;
        })}
      </div>
    </>
  );
}

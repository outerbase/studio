"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { LucideDatabase, LucidePen, LucideTrash } from "lucide-react";
import parseSafeJson from "@/lib/json-safe";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { validateConnectionEndpoint } from "@/lib/validation";

interface ConnectionItem {
  id: string;
  name: string;
  url: string;
  token: string;
  last_used: number;
}

function getConnections() {
  return parseSafeJson<ConnectionItem[]>(
    localStorage.getItem("connections"),
    []
  );
}

function updateConnections(connections: ConnectionItem[]) {
  localStorage.setItem("connections", JSON.stringify(connections));
}

function updateConnectionLastUsed(id: string) {
  const conns = getConnections();
  const matchedConnection = conns.find((conn) => conn.id === id);
  if (matchedConnection) {
    matchedConnection.last_used = Date.now();
    updateConnections(conns);
  }
}

function ConnectionEdit({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setName("");
    setUrl("");
    setToken("");
    setError("");
  }, [open]);

  const onSaveClicked = () => {
    // Validate the connection
    const [isUrlInvalid, urlInvalidMessage] = validateConnectionEndpoint(url);
    if (isUrlInvalid) {
      setError(urlInvalidMessage);
      return;
    }

    updateConnections([
      {
        id: crypto.randomUUID(),
        name: name || url,
        url,
        token,
        last_used: Date.now(),
      },
      ...getConnections(),
    ]);

    setOpen(false);
    onComplete();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant={"link"}>Add New Connection</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Connection</SheetTitle>

          {error && (
            <SheetDescription>
              <div className="bg-red-200 rounded p-4">
                <div>
                  <strong>Error</strong>
                </div>
                {error}
              </div>
            </SheetDescription>
          )}

          <SheetDescription>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Name</Label>
                <Input
                  id="url"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Link</Label>
                <Input
                  id="url"
                  placeholder="wss://example.turso.io"
                  value={url}
                  onChange={(e) => setUrl(e.currentTarget.value)}
                />
              </div>

              <div className="flex flex-col space-y-1.5 mb-5">
                <Label htmlFor="url">Token</Label>
                <Textarea
                  placeholder=""
                  rows={5}
                  value={token}
                  onChange={(e) => setToken(e.currentTarget.value)}
                />
              </div>
            </div>
          </SheetDescription>
          <SheetFooter>
            <Button onClick={onSaveClicked}>Save</Button>
          </SheetFooter>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

export default function ConnectionConfigScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  const [connections, setConnections] = useState(() => {
    return getConnections();
  });

  const connect = useCallback(
    (url: string, token: string) => {
      sessionStorage.setItem(
        "connection",
        JSON.stringify({
          url,
          token,
        })
      );

      router.push(`/client`);
    },
    [router]
  );

  const onConnectClicked = () => {
    if (url && token) {
      connect(url, token);
    }
  };

  const onConnectionListChange = () => {
    setConnections(getConnections());
  };

  const onSavedConnectionConnect = (conn: ConnectionItem) => {
    updateConnectionLastUsed(conn.id);
    connect(conn.url, conn.token);
  };

  const onSavedConnectionRemoved = (conn: ConnectionItem) => {
    const newConnectionList = getConnections().filter((c) => c.id !== conn.id);
    setConnections(newConnectionList);
    updateConnections(newConnectionList);
  };

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <div
          className="mb-4 flex gap-2 text-2xl text-white font-semibold items-center justify-center pt-4 pb-4 rounded-lg select-none"
          style={{ background: "#2C5FC3" }}
        >
          <img
            src="/libsql-logo.png"
            alt="LibSQL Studio"
            className="w-16 h-16"
          />
          LibSQL Studio
        </div>

        <CardDescription>
          Connect to your LibSQL securely. This client is entirely run in
          client-side. It does not store your credential.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex flex-col gap-2">
          {connections.map((connection) => {
            return (
              <div
                key={connection.id}
                className="bg-gray-100 p-2 rounded flex items-center cursor-pointer hover:bg-gray-200"
                onDoubleClick={() => onSavedConnectionConnect(connection)}
              >
                <LucideDatabase className="mr-4 ml-2" />
                <div className="flex-grow text-sm">
                  <div className="font-semibold">{connection.name}</div>
                  <div className="text-xs">{connection.url}</div>
                </div>
                <div className="">
                  <div
                    className="w-7 h-7 rounded-full bg-gray-300 flex justify-center items-center hover:bg-black hover:text-white"
                    onClick={() => onSavedConnectionRemoved(connection)}
                  >
                    <LucideTrash className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}

          <ConnectionEdit onComplete={onConnectionListChange} />
        </div>

        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Link</Label>
              <Input
                id="url"
                placeholder="wss://example.turso.io"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="token">Token</Label>
              <Input
                type="password"
                id="token"
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.currentTarget.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onConnectClicked}>Connect</Button>
      </CardFooter>
    </Card>
  );
}

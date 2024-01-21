"use client";
import { useMemo, useState } from "react";
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
import { LucideDatabase } from "lucide-react";
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

interface ConnectionItem {
  id: string;
  name: string;
  url: string;
  token: string;
  last_used: number;
}

function ConnectionEdit() {
  return (
    <Sheet>
      <SheetTrigger>
        <Button variant={"link"}>Add New Connection</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Connection</SheetTitle>
          <SheetDescription>
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Name</Label>
                <Input id="url" placeholder="" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Link</Label>
                <Input id="url" placeholder="libsql://example.turso.io" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">Token</Label>
                <Textarea placeholder="" rows={5} />
              </div>
            </div>
          </SheetDescription>
          <SheetFooter>
            <Button>Save</Button>
          </SheetFooter>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

export function ConnectionConfigScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  const connections = useMemo(() => {
    return parseSafeJson<ConnectionItem[]>(
      localStorage.getItem("connections"),
      []
    );
  }, []);

  const onConnectClicked = () => {
    if (url && token) {
      const sessionId = crypto.randomUUID();

      sessionStorage.setItem(
        "sess_" + sessionId,
        JSON.stringify({
          url,
          token,
        })
      );

      router.push(`/s/${sessionId}`);
    }
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
          <div className="bg-gray-100 p-2 rounded flex items-center cursor-pointer hover:bg-gray-200">
            <LucideDatabase className="mr-4 ml-2" />
            <div className="text-sm">
              <div className="font-semibold">libsql://testing.invisal.com</div>
              <div className="text-xs">5 days ago</div>
            </div>
          </div>

          <div className="bg-gray-100 p-2 rounded flex items-center cursor-pointer hover:bg-gray-200">
            <LucideDatabase className="mr-4 ml-2" />
            <div className="text-sm">
              <div className="font-semibold">libsql://testing.invisal.com</div>
              <div className="text-xs">5 days ago</div>
            </div>
          </div>

          <ConnectionEdit />
        </div>

        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Link</Label>
              <Input
                id="url"
                placeholder="libsql://example.turso.io"
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

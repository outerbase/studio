import { PropsWithChildren } from "react";
import { SupportedDriver } from "./saved-connection-storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Props {
  onSelect: (driver: SupportedDriver) => void;
}

export default function DriverDropdown({
  children,
  onSelect,
}: PropsWithChildren<Props>) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]">
        <DropdownMenuItem
          onClick={() => {
            onSelect("turso");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-12">
            <img src="/turso.jpeg" alt="turso" className="w-9 h-9 rounded-lg" />
            <div>
              <div className="font-bold">Turso / LibSQL</div>
              <div className="text-xs opacity-50">SQLite for Product</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onSelect("cloudflare-d1");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-12">
            <img src="/cloudflare.png" alt="rqlite" className="w-9 h-9" />
            <div>
              <div className="font-bold">Cloudflare D1</div>
              <div className="text-xs opacity-50">
                D1 is Cloudflare’s native serverless database
              </div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onSelect("rqlite");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-12">
            <img src="/rqlite.png" alt="rqlite" className="w-9 h-9" />
            <div>
              <div className="font-bold">rqlite</div>
              <div className="text-xs opacity-50">
                Distributed database built on SQLite
              </div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onSelect("valtown");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-12">
            <img src="/valtown.svg" alt="valtown" className="w-9 h-9 rounded" />
            <div>
              <div className="font-bold">val.town</div>
              <div className="text-xs opacity-50">Private SQLite database</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onSelect("sqlite-filehandler");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-16">
            <img src="/sqlite-icon.svg" alt="sqlite" className="w-9 h-9" />
            <div>
              <div className="font-bold">Open SQLite File</div>
              <div className="text-xs opacity-50">
                Open SQLite file database directly in your browser.
              </div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push("/playground/client");
          }}
        >
          <div className="flex gap-4 px-2 items-center h-16">
            <img src="/sqlite-icon.svg" alt="sqlite" className="w-9 h-9" />
            <div>
              <div className="font-bold">Blank SQLite</div>
              <div className="text-xs opacity-50">
                Start a new SQLite database directly in your browser.
              </div>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

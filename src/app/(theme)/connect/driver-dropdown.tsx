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
import {
  CloudflareIcon,
  MySQLIcon,
  PostgreIcon,
  SQLiteIcon,
  TursoIcon,
} from "@/components/icons/outerbase-icon";
import Link from "next/link";

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
      <DropdownMenuContent className="w-[500px]">
        <div className="flex">
          <div className="w-1/2 border-r pr-1">
            <span className="block text-xs ml-2 mb-2 mt-2 font-semibold text-muted-foreground">
              SQLite-based Database
            </span>
            <div>
              <DropdownMenuItem
                onClick={() => {
                  onSelect("turso");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <TursoIcon className="w-6 h-6" />
                  <div className="font-semibold">Turso / LibSQL</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  onSelect("cloudflare-d1");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <CloudflareIcon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Cloudflare D1</div>
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  onSelect("rqlite");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <img src="/rqlite.png" alt="rqlite" className="w-6 h-6" />
                  <div className="font-semibold">rqlite</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  onSelect("valtown");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <img
                    src="/valtown.svg"
                    alt="valtown"
                    className="w-6 h-6 rounded"
                  />
                  <div className="font-semibold">val.town</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  onSelect("sqlite-filehandler");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <SQLiteIcon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">SQLite File</div>
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  router.push("/playground/client");
                }}
              >
                <div className="flex gap-4 px-2 items-center h-8">
                  <SQLiteIcon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Blank SQLite</div>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
          </div>

          <div className="w-1/2 pl-1">
            <span className="block text-xs ml-2 mb-2 mt-2 font-semibold text-muted-foreground">
              Other
            </span>

            <div>
              <DropdownMenuItem>
                <Link
                  className="flex gap-4 px-2 items-center h-8 block"
                  href="/databases/mysql"
                  target="_blank"
                >
                  <MySQLIcon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">MySQL</div>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  onSelect("valtown");
                }}
              >
                <Link
                  className="flex gap-4 px-2 items-center h-8 block"
                  href="/databases/mysql"
                  target="_blank"
                >
                  <PostgreIcon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">PostgreSQL</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

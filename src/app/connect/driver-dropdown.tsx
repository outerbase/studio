import { PropsWithChildren } from "react";
import { SupportedDriver } from "./saved-connection-storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  onSelect: (driver: SupportedDriver) => void;
}

export default function DriverDropdown({
  children,
  onSelect,
}: PropsWithChildren<Props>) {
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
              <div className="font-bold">Turso</div>
              <div className="text-xs opacity-50">SQLite for Product</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onSelect("rqlite");
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

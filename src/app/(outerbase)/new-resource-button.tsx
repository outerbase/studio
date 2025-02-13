import { SQLiteIcon } from "@/components/icons/outerbase-icon";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { StarbaseIcon } from "@/components/resource-card/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaretDown, ChartBar, MagnifyingGlass } from "@phosphor-icons/react";

export default function NewResourceButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="primary">
          New Resource <CaretDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[500px]">
        <div className="p-2">
          <Input
            placeholder="Search"
            className="bg-secondary w-full"
            preText={<MagnifyingGlass className="mr-2" />}
          />
        </div>

        <div className="flex gap-4 p-2">
          <button className="bg-secondary flex w-[250px] items-center gap-4 rounded p-2 px-4 text-left text-base">
            <ChartBar className="h-8 w-8" />
            <div>
              <div className="font-semibold">StarbaseDB</div>
              <div className="text-sm">Multiple source dashboard</div>
            </div>
          </button>

          <button className="bg-secondary flex w-[200px] items-center gap-4 rounded p-2 px-4 text-left text-base">
            <StarbaseIcon className="h-8 w-8" />
            <div>
              <div className="font-semibold">StarbaseDB</div>
              <div className="text-sm">Free 10GB SQLite</div>
            </div>
          </button>
        </div>

        <h2 className="px-3 py-2 text-base font-semibold">
          Bring your existing databases
        </h2>

        <div className="flex">
          <div className="w-1/2 px-2">
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
          </div>
          <div className="w-1/2 px-2">
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base">
              <SQLiteIcon className="mr-2 h-6 w-6" />
              SQLite
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

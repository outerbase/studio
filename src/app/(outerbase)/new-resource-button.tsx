import { MySQLIcon, PostgreIcon } from "@/components/icons/outerbase-icon";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import {
  CloudflareIcon,
  DigitalOceanIcon,
  NeonIcon,
  StarbaseIcon,
  SupabaseIcon,
} from "@/components/resource-card/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CaretDown,
  ChartBar,
  Database,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { PropsWithChildren, useMemo, useState } from "react";

function CreateResourceItem({ children }: PropsWithChildren) {
  return (
    <button
      className={
        "bg-secondary flex w-full items-center justify-start rounded p-2 text-base"
      }
    >
      {children}
    </button>
  );
}

function CreateResourceItemSearch({
  children,
  selected,
}: PropsWithChildren<{ selected?: boolean }>) {
  return (
    <button
      className={cn(
        "hover:bg-secondary flex w-full items-center justify-start rounded p-2 text-base",
        { "bg-secondary": selected }
      )}
    >
      {children}
    </button>
  );
}

interface ResourceType {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  enterprise?: boolean;
}

const RESOURCE_TYPE_LIST: ResourceType[] = [
  { name: "Supabase", icon: SupabaseIcon },
  { name: "Cloudflare", icon: CloudflareIcon },
  { name: "Neon", icon: NeonIcon },
  { name: "StarbaseDB", icon: StarbaseIcon },
  { name: "DigitalOcean", icon: DigitalOceanIcon },
  { name: "Postgres", icon: PostgreIcon },
  { name: "Motherduck", icon: Database },
  { name: "SQL Server", icon: Database },
  { name: "MySQL", icon: MySQLIcon },
  { name: "Clickhouse", icon: Database, enterprise: true },
  { name: "Snowflake", icon: Database, enterprise: true },
  { name: "BigQuery", icon: Database, enterprise: true },
  { name: "Redshift", icon: Database, enterprise: true },
];

export default function NewResourceButton() {
  const leftSideResourceType = RESOURCE_TYPE_LIST.slice(0, 7);
  const rightSideResourceType = RESOURCE_TYPE_LIST.slice(7);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const allResourceType = (
    <>
      <div className="flex gap-4 p-2">
        <button className="bg-secondary flex w-[250px] items-center gap-4 rounded p-2 px-4 text-left text-base">
          <ChartBar className="h-8 w-8" />
          <div>
            <div className="font-semibold">Board</div>
            <div className="text-sm">Multiple source dashboard</div>
          </div>
        </button>

        <button className="flex w-[200px] items-center gap-4 rounded bg-gradient-to-r from-blue-800 to-indigo-900 p-2 px-4 text-left text-base text-white">
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

      <div className="my-2 flex">
        <div className="flex w-1/2 flex-col gap-2 px-2">
          {leftSideResourceType.map((resource) => (
            <CreateResourceItem key={resource.name}>
              <resource.icon className="mr-2 h-6 w-6" />
              <span>{resource.name}</span>
            </CreateResourceItem>
          ))}
        </div>

        <div className="flex w-1/2 flex-col gap-2 px-2">
          {rightSideResourceType.map((resource) => (
            <CreateResourceItem key={resource.name}>
              <resource.icon className="mr-2 h-6 w-6" />
              <span className="flex-1 text-left">{resource.name}</span>
              {resource.enterprise && (
                <span className="text-primary-foreground rounded border bg-zinc-500 px-1.5 py-0.5 text-sm">
                  Enterprise
                </span>
              )}
            </CreateResourceItem>
          ))}
        </div>
      </div>

      <h2 className="mt-4 px-3 py-1 text-base">Or use connection string</h2>
      <div className="mx-2 my-2 flex">
        <Input
          className="bg-secondary w-full"
          postText={<ArrowLeft className="mr-2" />}
          placeholder="postgres://testing"
        />
      </div>
    </>
  );

  const resourceSearch = useMemo(() => {
    const filteredResource = RESOURCE_TYPE_LIST.filter((resource) =>
      resource.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    if (filteredResource.length === 0) {
      return (
        <div className="flex h-16 flex-col items-center justify-center px-2 pb-2">
          <span className="text-base">
            There is no resource type of <strong>{search}</strong>
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col px-2 pb-2">
        {filteredResource
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
          .map((resource, resourceIdx) => (
            <CreateResourceItemSearch
              key={resource.name}
              selected={resourceIdx === 0}
            >
              <resource.icon className="mr-2 h-6 w-6" />
              <span className="flex-1 text-left">{resource.name}</span>
              {resource.enterprise && (
                <span className="text-primary-foreground rounded border bg-zinc-500 px-1.5 py-0.5 text-sm">
                  Enterprise
                </span>
              )}
            </CreateResourceItemSearch>
          ))}
      </div>
    );
  }, [search]);

  return (
    <>
      <DropdownMenu
        onOpenChange={(openState) => {
          setSearch("");
          setOpen(openState);
        }}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="primary" className={open ? "z-25" : ""}>
            New Resource <CaretDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[500px] shadow-xl">
          <div className="p-2">
            <Input
              placeholder="Search"
              autoFocus
              className="bg-secondary w-full"
              value={search}
              onValueChange={setSearch}
              preText={<MagnifyingGlass className="mr-2" />}
            />
          </div>

          {search ? resourceSearch : allResourceType}
        </DropdownMenuContent>
      </DropdownMenu>
      {open && (
        <div className="fixed top-0 right-0 bottom-0 left-0 z-20 backdrop-blur-sm"></div>
      )}
    </>
  );
}

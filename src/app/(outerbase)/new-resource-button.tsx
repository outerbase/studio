import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CaretDown, ChartBar, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { PropsWithChildren, useMemo, useState } from "react";
import { getCreateResourceTypeList } from "./new-resource-list";

function CreateResourceItem({
  selected,
  data,
}: PropsWithChildren<{ data: NewResourceType; selected?: boolean }>) {
  if (data.comingSoon) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex w-full cursor-pointer items-center justify-start rounded p-2 text-base",
          { "bg-secondary": selected },
          data.colorClassName
        )}
      >
        <data.icon className="mr-2 h-6 w-6" />
        <span className="flex-1 text-left">{data.name}</span>
        {data.comingSoon && (
          <span className="text-primary-foreground rounded border bg-zinc-500 px-1.5 py-0.5 text-xs">
            Coming Soon
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      prefetch={false}
      href={data.href}
      className={cn(
        "hover:bg-secondary flex w-full cursor-pointer items-center justify-start rounded p-2 text-base",
        { "bg-secondary": selected },
        data.colorClassName
      )}
    >
      <data.icon className="mr-2 h-6 w-6" />
      <span className="flex-1 text-left">{data.name}</span>
    </Link>
  );
}

export interface NewResourceType {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
  comingSoon?: boolean;
  colorClassName?: string;
  thirdParty?: boolean;
}
interface NewResourceProps {
  onCreateBoard?: () => void;
  workspaceId?: string;
}

export default function NewResourceType({
  onCreateBoard,
  workspaceId,
}: NewResourceProps) {
  const resourceTypeList = useMemo(() => {
    const tmp = getCreateResourceTypeList(workspaceId);
    tmp.sort((a, b) => a.name.localeCompare(b.name));
    return tmp;
  }, [workspaceId]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const allResourceType = (
    <>
      <div className="flex gap-4 p-2">
        <button
          className="bg-secondary flex w-[250px] cursor-pointer items-center gap-4 rounded p-2 px-4 text-left text-base"
          onClick={onCreateBoard}
        >
          <ChartBar className="h-8 w-8" />
          <div>
            <div className="font-semibold">Board</div>
            <div className="text-sm">Multiple source dashboard</div>
          </div>
        </button>

        {/* <button className="flex w-[200px] items-center gap-4 rounded bg-gradient-to-r from-blue-800 to-indigo-900 p-2 px-4 text-left text-base text-white">
          <StarbaseIcon className="h-8 w-8" />
          <div>
            <div className="font-semibold">StarbaseDB</div>
            <div className="text-sm">Free 10GB SQLite</div>
          </div>
        </button> */}
      </div>

      <h2 className="px-3 py-2 text-base font-semibold">
        Bring your existing databases
      </h2>

      <div className="my-2 flex">
        <div className="flex w-1/2 flex-col gap-2 px-2">
          {resourceTypeList
            .filter((resource) => !resource.thirdParty)
            .filter((_, idx) => idx % 2 === 0)
            .map((resource) => (
              <CreateResourceItem key={resource.name} data={resource} />
            ))}
        </div>

        <div className="flex w-1/2 flex-col gap-2 px-2">
          {resourceTypeList
            .filter((resource) => !resource.thirdParty)
            .filter((_, idx) => idx % 2 === 1)
            .map((resource) => (
              <CreateResourceItem key={resource.name} data={resource} />
            ))}
        </div>
      </div>

      <h2 className="border-t px-3 py-2 pt-4 text-base font-semibold">
        Third party integrations
      </h2>

      <div className="my- flex">
        <div className="flex w-1/2 flex-col gap-2 px-2">
          {resourceTypeList
            .filter((resource) => !!resource.thirdParty)
            .filter((_, idx) => idx % 2 === 0)
            .map((resource) => (
              <CreateResourceItem key={resource.name} data={resource} />
            ))}
        </div>

        <div className="flex w-1/2 flex-col gap-2 px-2">
          {resourceTypeList
            .filter((resource) => !!resource.thirdParty)
            .filter((_, idx) => idx % 2 === 1)
            .map((resource) => (
              <CreateResourceItem key={resource.name} data={resource} />
            ))}
        </div>
      </div>

      {/* <h2 className="mt-4 px-3 py-1 text-base">Or use connection string</h2>
      <div className="mx-2 my-2 flex">
        <Input
          className="bg-secondary w-full"
          postText={<ArrowLeft className="mr-2" />}
          placeholder="postgres://testing"
        />
      </div> */}
    </>
  );

  const resourceSearch = useMemo(() => {
    const filteredResource = resourceTypeList
      .filter((resource) =>
        resource.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
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
      <div className="flex flex-col gap-0.5 px-2 pb-2">
        {filteredResource
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
          .map((resource, resourceIdx) => (
            <CreateResourceItem
              key={resource.name}
              data={resource}
              selected={resourceIdx === 0}
            />
          ))}
      </div>
    );
  }, [search, resourceTypeList]);

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

import { cn } from "@/lib/utils";
import { Database, Gear } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useWorkspaces } from "./workspace-provider";

export default function NavigationHeader() {
  const tabClassName =
    "p-2 border-b-2 border-background flex gap-2 items-center h-full";
  const selectedTabClassName = cn(tabClassName, "border-orange-500");

  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { currentWorkspace } = useWorkspaces();
  const pathname = usePathname();

  return (
    <div className="bg-background flex h-12 flex-col gap-1 border-b px-6">
      <nav className="flex h-full gap-2 text-sm">
        <Link
          className={
            pathname.endsWith(workspaceId) ? selectedTabClassName : tabClassName
          }
          href={`/w/${workspaceId}`}
        >
          <Database />
          Resources
        </Link>
        <Link
          className={
            pathname.endsWith(`/${workspaceId}/settings`)
              ? selectedTabClassName
              : tabClassName
          }
          href={`/w/${workspaceId}/settings`}
        >
          <Gear />
          Settings
        </Link>
        {/* <Link
          className={
            pathname.endsWith(`/${workspaceId}/billing`)
              ? selectedTabClassName
              : tabClassName
          }
          href={`/w/${workspaceId}/billing`}
        >
          <Cardholder />
          Billing
        </Link> */}

        <div className="flex flex-1 items-center justify-end font-bold">
          {currentWorkspace?.name ?? ""}
        </div>
      </nav>
    </div>
  );
}

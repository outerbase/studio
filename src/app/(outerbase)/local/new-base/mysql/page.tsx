"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { Button } from "@/components/orbit/button";
import { Loader } from "@/components/orbit/loader";
import { ArrowLeft, Folder } from "@phosphor-icons/react";
import Link from "next/link";

function LocalMySQLCloudSection() {
  const { isLoading, session } = useSession();
  const { workspaces, loading } = useWorkspaces();

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[300px] w-1/2 flex-col items-center justify-center gap-4 p-4">
        <Loader size={40} />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex w-1/2 flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">Outerbase Cloud</h1>

        <div>
          <p>Connect to our cloud services</p>
          <ul className="">
            <li>Benefit 1</li>
            <li>Benefit 2</li>
            <li>Benefit 3</li>
            <li>Benefit 4</li>
          </ul>
        </div>

        <div>
          <Button
            variant="primary"
            className="inline-flex"
            size="lg"
            href="/signin"
            as="link"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-1/2 flex-col gap-2 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Outerbase Cloud</h1>
        <p>Please select the workspace</p>
      </div>

      {(workspaces ?? []).map((workspace) => {
        return (
          <Link
            key={workspace.id}
            className="bg-secondary hover:border-primary flex cursor-pointer items-center gap-2 rounded border border-2 p-4 text-base"
            href={`/w/${workspace.short_name}/new-base/mysql`}
          >
            <Folder weight="bold" size={20} />
            {workspace.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function LocalMySQLNewBasePage() {
  return (
    <div className="container">
      <div className="my-8 flex">
        <Button variant="secondary" size="lg" href="/local" as="link">
          <ArrowLeft />
          Back
        </Button>
      </div>

      <div className="mb-8 p-4 text-xl leading-8">
        Running MySQL from a browser is not possible.
        <br /> Please use the desktop app or our cloud services instead.
      </div>

      <div className="mb-8 flex">
        <LocalMySQLCloudSection />

        <div className="flex w-1/2 flex-col gap-4 p-4">
          <div>
            <h1 className="text-2xl font-bold">Desktop App</h1>
            <p>Connect locally with our desktop app</p>
          </div>

          <Link
            href="https://github.com/outerbase/studio-desktop/releases"
            className="relative w-full"
          >
            <img
              src="/outerbase-banner.jpg"
              alt=""
              className="w-full rounded-lg"
            />

            <div className="bg-opacity-50 absolute right-0 bottom-0 left-0 flex cursor-pointer flex-col gap-2 rounded-lg bg-black p-4 text-white">
              <div className="text-2xl font-bold">Download the desktop app</div>
              <p className="text-base">
                Outerbase Studio Desktop is a lightweight Electron wrapper for
                the Outerbase Studio web version. It enables support for drivers
                that aren&apos;t feasible in a browser environment, such as
                MySQL and PostgreSQL.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

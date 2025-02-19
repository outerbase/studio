"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { Button } from "@/components/orbit/button";
import { Loader } from "@/components/orbit/loader";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

function LocalMySQLCloudSection() {
  const { isLoading, session } = useSession();
  const { workspaces, loading } = useWorkspaces();

  if (isLoading || loading) {
    return (
      <div className="flex w-1/2 flex-col gap-4 border-r p-4">
        <Loader />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex w-1/2 flex-col gap-4 border-r p-4">
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
    <div className="flex w-1/2 flex-col gap-4 border-r p-4">
      <h1 className="text-lg font-bold">Outerbase Cloud</h1>
      <p>Please select the workspace</p>
      {(workspaces ?? []).map((workspace) => {
        return (
          <Link
            key={workspace.id}
            href={`/w/${workspace.short_name}/new-base/mysql`}
          >
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

      <div className="mb-12 p-4">
        It is not possible to run MySQL from browser.
        <br /> Please use the desktop app or our cloud services.
      </div>

      <div className="flex">
        <LocalMySQLCloudSection />

        <div className="flex w-1/2 flex-col gap-4 p-4">
          <h1 className="text-lg font-bold">Desktop App</h1>

          <div>Connect locally with our desktop app</div>

          <div>
            <Button
              variant="primary"
              className="inline-flex"
              size="lg"
              href="https://github.com/outerbase/studio-desktop/releases"
              as="link"
            >
              Download Desktop App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

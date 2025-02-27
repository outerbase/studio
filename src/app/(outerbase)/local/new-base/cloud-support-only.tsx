"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { Button } from "@/components/orbit/button";
import { Loader } from "@/components/orbit/loader";
import { getDatabaseFriendlyName } from "@/components/resource-card/utils";
import {
  ArrowLeft,
  ChartBar,
  Folder,
  Icon,
  MagicWand,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";
import Link from "next/link";

function OuterbaseHighlightCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: Icon;
}) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="mb-4">
        <div className="bg-muted inline-flex rounded p-4">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h2 className="font-bold">{title}</h2>
      <p className="text-base">{description}</p>
    </div>
  );
}

function SignupPromotion({ type }: { type: string }) {
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
      <div className="flex w-1/2 flex-col p-4">
        <h1 className="text-2xl font-bold">Outerbase Cloud</h1>

        <Link
          href="/signin"
          className="text-primary-foreground bg-primary my-4 rounded-lg p-4 px-4 text-center text-xl font-semibold"
        >
          Sign In To Our Cloud
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <OuterbaseHighlightCard
            icon={UsersThree}
            title="Collaboration"
            description="Collaborate with your team to explore and analyze the data, and share insights from the database."
          />

          <OuterbaseHighlightCard
            icon={MagicWand}
            title="AI-powered"
            description="Integrate AI to assist with querying, chart generation, and more."
          />

          <OuterbaseHighlightCard
            icon={ChartBar}
            title="Visual Charts"
            description="Create visually appealing charts from multiple data sources in minutes."
          />

          <OuterbaseHighlightCard
            icon={ShieldCheck}
            title="HIPAA Compliant"
            description="We protect patient health details, keeping them safe and confidential."
          />
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
            href={`/w/${workspace.short_name}/new-base/${type}`}
          >
            <Folder weight="bold" size={20} />
            {workspace.name}
          </Link>
        );
      })}
    </div>
  );
}

export function CloudDriverSupportOnly({ type }: { type: string }) {
  return (
    <div className="container">
      <div className="my-8 flex">
        <Button variant="secondary" size="lg" href="/local" as="link">
          <ArrowLeft />
          Back
        </Button>
      </div>

      <div className="mb-8 p-4 text-xl leading-8">
        Running {getDatabaseFriendlyName(type)} from a browser is not possible.
        <br /> Please use the desktop app or our cloud services instead.
      </div>

      <div className="mb-8 flex">
        <SignupPromotion type={type} />

        <div className="flex w-1/2 flex-col gap-4 p-4">
          <div>
            <h1 className="text-2xl font-bold">Desktop App</h1>
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

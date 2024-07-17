import { buttonVariants } from "@/components/ui/button";
import WebsiteLayout from "@/components/website-layout";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LibSQL Studio - LibSQL and rqlite client on your browser",
  description: "LibSQL Studio - LibSQL and rqlite client on your browser",
};

function LinkButton({ title, url }: Readonly<{ title: string; url: string }>) {
  return (
    <Link
      href={url}
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "text-2xl p-6"
      )}
    >
      {title}
    </Link>
  );
}

function TestimonyItem() {
  return (
    <div className="bg-secondary p-4 rounded-lg">
      <div className="font-bold">Review Name</div>
      <div>Company Name</div>
      <div className="text-red-500 text-xl">★★★★★</div>
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book
      </p>
    </div>
  );
}

function TestimonyList() {
  return (
    <div className="mx-auto max-w-[800px]">
      <div className="grid grid-cols-2 gap-4">
        <TestimonyItem />
        <TestimonyItem />
      </div>
      <div className="text-xl mt-4 px-4">
        and thousands of happy developers use our tools.
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-16">
      <div className="flex flex-col gap-4 justify-center mb-12 md:flex-row">
        <LinkButton title="Open LibSQL Studio" url="/connect" />
      </div>

      <h2 className="text-center text-6xl font-bold">
        Powerful SQLite-based Database Client
      </h2>

      <p className="text-center max-w-[700px] mx-auto mt-6 text-lg">
        LibSQL Studio is a fully-featured, lightweight GUI client for managing
        SQLite-based databases like Turso, LibSQL, and rqlite. It runs entirely
        in your browser, so there&apos;s no need to download anything.
      </p>
    </div>
  );
}

function SupportDriver() {
  return (
    <div className="mt-12">
      <div className="container mx-auto py-12">
        <h2 className="text-center font-semibold text-2xl">
          Supports a wide range of{" "}
          <strong className="border-b-4 border-red-400 inline-block py-1 mx-1">
            SQLite-based
          </strong>{" "}
          databases
        </h2>

        <div className="flex justify-center gap-4 mt-8">
          <img src="/turso.jpeg" className="h-16 rounded-xl" alt="rqlite" />
          <img src="/rqlite.png" className="h-16 rounded-xl" alt="rqlite" />
          <img src="/valtown.svg" className="h-16 rounded-xl" alt="rqlite" />
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <div className="mx-auto max-w-[800px] p-4 mt-12">
      <div className="py-12">
        <h1 className="text-3xl font-semibold mb-2">Powerful Data Editor</h1>

        <p className="text-xl mb-4">
          The handy data editor allows you to add, delete, and edit information.
          Any changes you make in the data editor are saved on your device and
          can be submitted all at once.
        </p>
      </div>

      <div>
        <div className="fade-view">
          <video muted autoPlay loop className="rounded-lg">
            <source
              src="https://r2.invisal.com/libsqlstudio-table-editor.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12">
          <h1 className="text-3xl font-semibold mb-2">Create and Edit Table</h1>

          <p className="text-xl mb-4">
            LibSQL Studio allows you to quickly create, modify, and remove table
            columns with just a few clicks without writing any SQL.
          </p>
        </div>
      </div>

      <div>
        <div className="fade-view">
          <video muted autoPlay loop className="rounded-lg">
            <source
              src="https://r2.invisal.com/libsqlstudio-table-editor.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12">
          <h1 className="text-3xl font-semibold mb-2">
            Writing and Running SQL
          </h1>

          <p className="text-xl mb-4">
            LibSQL Studio offers a simple query editor with auto-completion
            features. You can run multiple queries and view their results
          </p>
        </div>
      </div>

      <div>
        <div className="fade-view">
          <video muted autoPlay loop className="rounded-lg">
            <source
              src="https://r2.invisal.com/libsqlstudio-table-editor.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12">
          <div className="text-3xl font-semibold mb-2">
            and much much more...
          </div>

          <p className="text-xl mb-4">
            LibSQL Studio has many features and is regularly updated. Since it
            is an open-source project, you can request new features or even
            extend them yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function MainPage() {
  return (
    <WebsiteLayout>
      <HeroSection />
      <TestimonyList />
      <FeatureList />
      <SupportDriver />
      <div className="h-32"></div>
    </WebsiteLayout>
  );
}

import { buttonVariants } from "@/components/ui/button";
import WebsiteLayout from "@/components/website-layout";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import type { PropsWithChildren } from "react";

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

function Screenshot() {
  return (
    <div className="my-2 mx-4">
      <div className="max-w-[800px] mx-auto border-2 border-gray-200 bg-gray-200 rounded-lg overflow-hidden">
        <div className="h-6 flex items-center">
          <div className="grow" />
          <div className="px-2 flex gap-1">
            <div className="rounded-full h-3 w-3 bg-red-500" />
            <div className="rounded-full h-3 w-3 bg-yellow-400" />
            <div className="rounded-full h-3 w-3 bg-green-600" />
          </div>
        </div>
        <img
          src="/screenshot2.png"
          className="w-full"
          alt="LibSQL Studio Powerful Browser Database GUI"
          style={{ aspectRatio: 1134 / 649 }}
        />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="mx-auto container py-16">
      <div className="flex flex-col gap-4 justify-center mb-8 md:flex-row">
        <LinkButton title="Open LibSQL Studio" url="/connect" />
      </div>

      <h2 className="text-center text-4xl font-bold">
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

function FeatureItem({
  children,
  image,
  reverse,
}: PropsWithChildren<{ reverse?: boolean; image?: string }>) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div
        className={
          reverse
            ? "md:w-1/2 lg:w-1/2 text-gray-300 flex flex-col justify-center order-1"
            : "md:w-1/2 lg:w-1/2 text-gray-300 flex flex-col justify-center order-1 lg:order-3"
        }
      >
        {children}
      </div>
      <div className="md:w-1/2 lg:w-1/2 order-2">
        {image ? (
          <img
            src={image}
            className="w-full rounded shadow-lg"
            alt="Data Editor"
          />
        ) : (
          <div className="h-[300px] bg-gray-500" />
        )}
      </div>
    </div>
  );
}

function SupportDriver() {
  return (
    <div className="bg-secondary mt-12">
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

export default async function MainPage() {
  return (
    <WebsiteLayout>
      <HeroSection />
      <Screenshot />
      <SupportDriver />
      <div className="bg-zinc-800 py-12">
        <div className="max-w-[900px] px-4 mx-auto flex flex-col gap-12">
          <FeatureItem reverse image="/data-editor.png">
            <h2 className="text-xl mb-4 font-semibold text-white">
              Powerful Data Editor
            </h2>

            <div className="flex flex-col gap-4">
              <p>
                The handy data editor allows you to add, delete, and edit
                information.
              </p>

              <p>
                Any changes you make in the data editor are saved on your device
                and can be submitted all at once.
              </p>

              <p>
                You can export any table or result set in various formats such
                as CSV, JSON, and SQL.
              </p>
            </div>
          </FeatureItem>

          <FeatureItem image="/sql-editor.png">
            <h2 className="text-xl mb-4 font-semibold text-white">
              Writing and Running SQL
            </h2>

            <div className="flex flex-col gap-4">
              <p>
                LibSQL Studio offers a simple query editor with auto-completion
                features. You can run multiple queries and view their results
              </p>
              <p>Enjoy unlimited query tab.</p>
            </div>
          </FeatureItem>

          <FeatureItem reverse image="/edit-table.png">
            <h2 className="text-xl mb-4 font-semibold text-white">
              Create and Edit Table
            </h2>
            <p>
              LibSQL Studio allows you to quickly create, modify, and remove
              table columns with just a few clicks without writing any SQL.
            </p>

            <p className="mt-4">
              Before executing, you have the option to preview the SQL script
              for creating or modifying a table.
            </p>
          </FeatureItem>

          <FeatureItem image="/open-source.png">
            <h2 className="text-xl mb-4 font-semibold text-white">
              No Download
            </h2>
            <p>
              There is no need to download anything. LibSQL Studio runs directly
              in your favorite web browser, making it compatible across
              different platforms.
            </p>

            <h2 className="text-xl mb-4 font-semibold text-white mt-8">
              Open Source and Free
            </h2>

            <p>
              LibSQL Studio is open source and completely free to use. You have
              the opportunity to suggest new features or even contribute to
              adding them yourself.
            </p>
          </FeatureItem>
        </div>
      </div>
    </WebsiteLayout>
  );
}

import {
  MySQLIcon,
  PostgreIcon,
  SQLiteIcon,
} from "@/components/icons/outerbase-icon";
import { buttonVariants } from "@/components/ui/button";
import WebsiteLayout from "@/components/website-layout";
import { WEBSITE_GENERAL_DESCRIPTION, WEBSITE_NAME } from "@/const";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: WEBSITE_NAME,
  keywords: [
    "libsql",
    "rqlite",
    "sqlite",
    "cloudflare d1",
    "studio",
    "browser",
    "editor",
    "gui",
    "online",
    "client",
  ],
  description: WEBSITE_GENERAL_DESCRIPTION,
  openGraph: {
    siteName: WEBSITE_NAME,
    description: WEBSITE_GENERAL_DESCRIPTION,
  },
};

function LinkButton({ title, url }: Readonly<{ title: string; url: string }>) {
  return (
    <Link
      href={url}
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "font-bold text-xl p-8 px-10 shadow-[6px_6px_0px_#999] hover:shadow-[8px_-4px_0px_#aaa] transition-all duration-400"
      )}
    >
      {title}
    </Link>
  );
}

function DatabaseBlock({
  children,
  center,
  link,
}: PropsWithChildren<{ center?: boolean; link: string }>) {
  return (
    <Link
      href={link}
      className={cn(
        "shadow-[8px_8px_0px_#111] hover:shadow-[8px_-8px_0px_#444] transition-all duration-200 border-2 border-zinc-800 rounded-lg flex flex-col gap-2 py-6 cursor-pointer px-4 hover:text-yellow-500",
        center ? "justify-center items-center" : ""
      )}
    >
      {children}
    </Link>
  );
}

function HeroSection() {
  return (
    <div className="mt-32 relative h-[428px]">
      <div
        className="absolute top-0 bottom-0 left-0 right-0 transform-gpu before:absolute before:top-0 before:z-10 before:h-32 before:w-full before:bg-gradient-to-b before:from-black before:to-black/0 after:absolute after:bottom-0 after:left-0 after:h-full after:w-full after:bg-gradient-to-t after:from-black after:to-black/0"
        style={{
          background: `url(/hero-banner.jpg)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>

      <div className="absolute top-0 bottom-0 left-0 right-0 -mt-16">
        <div className="mx-auto container">
          <h2 className="text-4xl font-bold text-white">
            Powerful Database Client
          </h2>
          <p className="max-w-[700px] mt-6 text-lg">
            {WEBSITE_NAME} is a fully-featured, lightweight GUI client for
            managing Turso, LibSQL, Cloudflare D1, rqlite, MySQL, and
            PostgreSQL. It runs entirely in your browser, so there&apos;s no
            need to download anything.
          </p>

          <div className="flex gap-4 mt-8">
            <LinkButton title={`Open ${WEBSITE_NAME}`} url="/connect" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportDriver() {
  return (
    <div>
      <div className="container mx-auto py-12 px-8">
        <div className="mb-4 font-semibold text-3xl text-white">
          Supporting Drivers
        </div>

        <p className="my-4 mb-8 max-w-[500px] text-zinc-400">
          We support a variety of databases, with more to come in the future.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <DatabaseBlock center link="#">
            <SQLiteIcon />
            <div>SQLite</div>
          </DatabaseBlock>

          <DatabaseBlock center link="#">
            <PostgreIcon />
            <span>PostgreSQL</span>
            <span className="text-xs -mt-2 text-yellow-500">
              Coming Soon 15th Sep 2024
            </span>
          </DatabaseBlock>

          <DatabaseBlock center link="/databases/mysql">
            <MySQLIcon />
            <span>MySQL</span>
          </DatabaseBlock>

          <DatabaseBlock center link="#">
            <SQLiteIcon />
            <div>LibSQL</div>
          </DatabaseBlock>
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <div className="mx-auto container mt-12">
      <div className="mb-4 font-semibold text-3xl text-white">
        Modern Design and <br />
        Intuitive Interface
      </div>

      <p className="my-4 max-w-[500px] text-zinc-400">
        Sleek modern design meets a thoughtfully crafted, intuitive user
        interface for a seamless experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-table-editor.mp4"
              type="video/mp4"
            />
          </video>

          <h1 className="font-semibold text-lg mt-4 text-white">
            Powerful Data Editor
          </h1>

          <p className="mt-2 text-zinc-400">
            The handy data editor allows you to add, delete, and edit
            information. Any changes you make in the data editor are saved on
            your device and can be submitted all at once.
          </p>
        </div>

        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-saved-query3.mp4"
              type="video/mp4"
            />
          </video>

          <h1 className="text-lg font-semibold mt-4 text-white">
            Saved Your Query
          </h1>

          <p className="mt-2 text-zinc-400">
            {WEBSITE_NAME} allows you to save your queries and organize them
            into folders, with the ability to sync across multiple devices.
          </p>
        </div>

        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-sql-query.mp4"
              type="video/mp4"
            />
          </video>

          <h1 className="text-lg font-semibold mt-4 text-white">
            Writing and Running SQL
          </h1>

          <p className="mt-2 text-zinc-400">
            {WEBSITE_NAME} features a user-friendly query editor equipped with
            auto-completion and function hint tooltips. It allows you to execute
            multiple queries simultaneously and view their results efficiently.
          </p>
        </div>

        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-schema-editor.mp4"
              type="video/mp4"
            />
          </video>

          <h1 className="font-semibold text-lg mt-4 text-white">
            Create and Edit Table
          </h1>

          <p className="mt-2 text-zinc-400">
            {WEBSITE_NAME} allows you to quickly create, modify, and remove
            table columns with just a few clicks without writing any SQL.
          </p>
        </div>
      </div>
    </div>
  );
}

function CommunitySection() {
  return (
    <div className="mx-auto container px-8 my-24">
      <h1 className="mb-4 font-semibold text-3xl text-white">Community</h1>

      <p className="mt-2 text-zinc-400 max-w-[500px] mb-8">
        Join our community for the latest updates, roadmap insights, and
        discussions on the future of {WEBSITE_NAME}.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <DatabaseBlock link="https://github.com/outerbase/libsql-studio">
          <svg
            width="98"
            height="96"
            viewBox="0 0 98 96"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
              fill="currentColor"
            />
          </svg>
          <div className="font-bold mt-1">Github</div>
        </DatabaseBlock>
        <DatabaseBlock link="https://discord.gg/CvfB3nzK">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 127.14 96.36"
            className="w-8 h-8"
          >
            <g>
              <path
                fill="currentColor"
                d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
              />
            </g>
          </svg>
          <div className="font-bold mt-1">Discord</div>
        </DatabaseBlock>
        <DatabaseBlock link="https://x.com/outerbase">
          <svg
            className="w-8 h-8"
            width="1200"
            height="1227"
            viewBox="0 0 1200 1227"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
              fill="currentColor"
            />
          </svg>
          <div className="font-bold mt-1">Twitter</div>
        </DatabaseBlock>
      </div>
    </div>
  );
}

export default async function MainPage() {
  return (
    <WebsiteLayout>
      <HeroSection />
      <SupportDriver />
      <FeatureList />
      <CommunitySection />
      <div className="mx-auto container">
        <div className="fade-sticky py-12 px-4">
          <div className="text-3xl font-semibold mb-2">
            and much much more...
          </div>

          <p className="tmb-4 max-w-[500px] text-zinc-400">
            {WEBSITE_NAME} has many features and is regularly updated. Since it
            is an{" "}
            <Link
              href="https://github.com/outerbase/libsql-studio"
              className="border-b-4 inline-block hover:border-yellow-500"
            >
              open-source
            </Link>{" "}
            project, you can{" "}
            <Link
              href="https://github.com/outerbase/libsql-studio/issues"
              className="border-b-4 inline-block hover:border-yellow-500"
            >
              request new features
            </Link>{" "}
            or even extend them yourself.
          </p>
        </div>
      </div>
      <div className="h-32"></div>
    </WebsiteLayout>
  );
}

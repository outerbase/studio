import { PostgreIcon } from "@/components/icons/outerbase-icon";
import WebsiteLayout from "@/components/website-layout";
import { WEBSITE_NAME } from "@/const";
import { Metadata } from "next";
import Link from "next/link";

const siteDescription = `${WEBSITE_NAME} is a fully-featured, lightweight GUI client for managing MySQL databases`;

export const metadata: Metadata = {
  title: `PostgreSQL - ${WEBSITE_NAME}`,
  keywords: [
    "postgresql",
    "studio",
    "browser",
    "editor",
    "gui",
    "online",
    "client",
  ],
  description: siteDescription,
  openGraph: {
    siteName: WEBSITE_NAME,
    description: siteDescription,
  },
};

function HeroSection() {
  return (
    <div className="mt-24 relative">
      <div className="mx-auto max-w-[800px] p-2">
        <h2 className="text-4xl flex gap-4 justify-center items-center font-bold text-white">
          <PostgreIcon />
          <span>PostgreSQL Support</span>
        </h2>

        <p className="mt-6 text-lg text-center">
          {WEBSITE_NAME} is a lightweight GUI client for PostgreSQL databases.
          It enables you to manage and view your database.
        </p>

        <p className="my-12 text-center">
          <Link
            className="bg-primary text-primary-foreground px-4 py-4 font-bold rounded-lg"
            href="https://github.com/outerbase/studio-desktop/releases"
          >
            Download Mac and Windows
          </Link>
        </p>

        <video muted autoPlay loop className="lg:rounded-lg" playsInline>
          <source
            src="https://r2.invisal.com/libsqlstudio-postgres.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  );
}

export default function DatabaseMySqlPage() {
  return (
    <WebsiteLayout>
      <HeroSection />
      <div className="h-[200px]"></div>
    </WebsiteLayout>
  );
}

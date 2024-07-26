import { buttonVariants } from "@/components/ui/button";
import WebsiteLayout from "@/components/website-layout";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

const siteDescription =
  "LibSQL Studio is a fully-featured, lightweight GUI client for managing SQLite-based databases like Turso, LibSQL, and rqlite. It runs entirely in your browser, so there's no need to download anything";

export const metadata: Metadata = {
  title: "LibSQL Studio",
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
  description: siteDescription,
  openGraph: {
    siteName: "LibSQL Studio",
    description: siteDescription,
  },
};

interface Review {
  id: number;
  name: string;
  picture?: string;
  initial?: string;
  content: string;
}

const review: Review[] = [
  {
    id: 1,
    name: "Jamie Barton",
    picture: "https://github.com/notrab.png",
    content:
      "libSQL Studio is a fantastic all-in-one tool for editing data and executing SQL queries that comes with a great DX. Its auto-completion feature boosts productivity and reduces errors, while saved queries make managing and reusing SQL a breeze.",
  },
  {
    id: 2,
    name: "Kim Thean",
    initial: "KT",
    content:
      "libSQL Studio offers everything I need to work with Turso. The best part is that there's no need to download anything, and it continues to improve with regular updates.",
  },
];

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

function TestimonyItem({ data }: { data: Review }) {
  return (
    <div className="bg-secondary p-6 rounded-lg">
      <div className="flex gap-2 mb-2">
        {data.picture && (
          <img
            src={data.picture}
            className="w-12 h-12 rounded-full"
            alt={data.name}
          />
        )}
        {data.initial && (
          <div className="w-12 h-12 rounded-full bg-yellow-500 text-xl font-bold flex justify-center items-center text-white">
            {data.initial}
          </div>
        )}
        <div>
          <div className="font-bold">{data.name}</div>
          <div className="text-red-500 text-xl">★★★★★</div>
        </div>
      </div>
      <p>{data.content}</p>
    </div>
  );
}

function TestimonyList() {
  return (
    <div className="mx-auto max-w-[800px] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {review.map((r) => (
          <TestimonyItem data={r} key={r.id} />
        ))}
      </div>
      <div className="text-xl mt-4 pl-4 pr-2">
        and thousands of{" "}
        <span className="border-b-4 border-b-yellow-500">happy developers</span>{" "}
        use our tools.
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="mx-auto max-w-[800px] px-4 pb-8 pt-16">
      <h2 className="text-center text-4xl lg:text-6xl font-bold">
        Powerful SQLite-based Database Client
      </h2>

      <p className="text-center max-w-[700px] mx-auto mt-6 text-lg">
        LibSQL Studio is a fully-featured, lightweight GUI client for managing
        SQLite-based databases like Turso, LibSQL, Cloudflare D1 and rqlite. It
        runs entirely in your browser, so there&apos;s no need to download
        anything.
      </p>

      <div className="flex gap-4 justify-center mt-12">
        <LinkButton title="Open LibSQL Studio" url="/connect" />
      </div>
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
          <img
            src="/sqlite-icon.svg"
            className="h-16 rounded-xl"
            alt="rqlite"
          />
          <img src="/turso.jpeg" className="h-16 rounded-xl" alt="turso" />
          <img
            src="/cloudflare.png"
            className="h-16 rounded-xl"
            alt="cloudflare d1"
          />
          <img src="/rqlite.png" className="h-16 rounded-xl" alt="rqlite" />
          <img src="/valtown.svg" className="h-16 rounded-xl" alt="valtown" />
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <div className="mx-auto max-w-[800px] mt-12">
      <div className="py-12 px-4">
        <h1 className="text-3xl font-semibold mb-2">Powerful Data Editor</h1>

        <p className="text-xl mb-4">
          The handy data editor allows you to add, delete, and edit information.
          Any changes you make in the data editor are saved on your device and
          can be submitted all at once.
        </p>
      </div>

      <div>
        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-table-editor.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12 px-4">
          <h1 className="text-3xl font-semibold mb-2">Create and Edit Table</h1>

          <p className="text-xl mb-4">
            LibSQL Studio allows you to quickly create, modify, and remove table
            columns with just a few clicks without writing any SQL.
          </p>
        </div>
      </div>

      <div>
        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-schema-editor.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12 px-4">
          <h1 className="text-3xl font-semibold mb-2">
            Writing and Running SQL
          </h1>

          <p className="text-xl mb-4">
            LibSQL Studio features a user-friendly query editor equipped with
            auto-completion and function hint tooltips. It allows you to execute
            multiple queries simultaneously and view their results efficiently.
          </p>
        </div>
      </div>

      <div>
        <div>
          <video muted autoPlay loop className="lg:rounded-lg" playsInline>
            <source
              src="https://r2.invisal.com/libsqlstudio-sql-query.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="fade-sticky py-12 px-4">
          <div className="text-3xl font-semibold mb-2">
            and much much more...
          </div>

          <p className="text-xl mb-4">
            LibSQL Studio has many features and is regularly updated. Since it
            is an{" "}
            <Link
              href="https://github.com/invisal/libsql-studio"
              className="border-b-4 inline-block hover:border-yellow-500"
            >
              open-source
            </Link>{" "}
            project, you can{" "}
            <Link
              href="https://github.com/invisal/libsql-studio/issues"
              className="border-b-4 inline-block hover:border-yellow-500"
            >
              request new features
            </Link>{" "}
            or even extend them yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function MainPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "SoftwareApplication",
            applicationCategory: "DeveloperApplication",
            name: "LibSQL Studio",
            description: siteDescription,
            operatingSystem: "Web",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: 5,
              reviewCount: review.length,
            },
            offers: {
              "@type": "Offer",
              price: 0,
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <WebsiteLayout>
        <HeroSection />
        <TestimonyList />
        <FeatureList />
        <SupportDriver />
        <div className="h-32"></div>
      </WebsiteLayout>
    </>
  );
}

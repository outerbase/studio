import { SQLiteIcon } from "@/components/icons/outerbase-icon";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import WebsiteLayout from "@/components/website-layout";
import { get_database } from "@/db";
import { dbDataset } from "@/db/schema-dataset";
import { Metadata } from "next";
import Link from "next/link";
import MySQLPlaygroundButton from "./mysql-playground-button";

export const metadata: Metadata = {
  title: "SQLite Online Editor",
  description:
    "A robust SQLite editor available directly in your browser. Explore and practice SQLite with ease. Begin with a blank database or choose from a selection of sample datasets.",
};

export default async function PlaygroundPage() {
  let templateList: (typeof dbDataset.$inferSelect)[] = [];

  try {
    const db = get_database();
    templateList = await db.select().from(dbDataset);
  } catch {
    templateList = [];
  }

  return (
    <WebsiteLayout>
      <div className="my-12 mx-auto container">
        <h1 className="text-3xl font-bold">Playground</h1>
        <p className="my-2 max-w-[600px] text-secondary-foreground">
          A robust SQLite editor available directly in your browser. Explore and
          practice SQLite with ease. Begin with a blank database or choose from
          a selection of sample datasets.
        </p>

        <div className="flex gap-2 mt-8">
          <Link
            passHref
            href="/playground/client"
            className={
              "bg-primary text-primary-foreground p-3 px-4 rounded-lg text-sm gap-2 flex flex-col hover:bg-gray-300 w-[200px]"
            }
            prefetch={false}
          >
            <div className="flex gap-2">
              <SQLiteIcon className="w-10 h-10" />
              <div className="flex flex-col justify-center">
                <div className="font-bold text-md">SQLite</div>
                <div className="text-xs">Playground</div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Launch in-memory SQLite
              <br />
              inside the browser
            </p>
          </Link>

          <MySQLPlaygroundButton />
        </div>
      </div>

      <Separator />

      <div className="py-4 mx-auto container">
        <h2 className="text-2xl font-bold mb-2">Existing Dataset</h2>
        <p className="mb-4">Preload the database with existing dataset.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templateList.map((t) => {
            return (
              <div className="border p-4 rounded-lg shadow-sm" key={t.id}>
                <h2 className="font-bold mb-2">{t.name}</h2>
                <p className="text-sm text-secondary-foreground">{t.summary}</p>
                <div className="mt-2">
                  <Link
                    passHref
                    href={`/playground/client?template=${t.id}`}
                    rel="nofollow"
                    className={buttonVariants({
                      size: "sm",
                    })}
                  >
                    Explore
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WebsiteLayout>
  );
}

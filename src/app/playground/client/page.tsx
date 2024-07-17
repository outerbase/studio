import { get_database } from "@/db";
import PlaygroundEditorBody from "./page-client";
import { eq, sql } from "drizzle-orm";
import { dbDataset } from "@/db/schema-dataset";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "SQLite Online Playground - Powerful and lightweight editor on your browser",
  description:
    "Explore the powerful SQLite Playground in your browser – no downloads or registration needed. Effortlessly load your SQLite files or start with a blank database, then save your work with ease. Enjoy a robust data editor, advanced query capabilities, table creation, and much more.",
  keywords: [
    "sqlite",
    "libsql",
    "browser",
    "client",
    "gui",
    "playground",
    "sandbox",
    "explorer",
    "studio",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PlaygroundEditor({
  searchParams,
}: {
  searchParams: { template: string };
}) {
  const templateName = searchParams.template;
  let templateFile: string | null = null;

  if (templateName) {
    const db = get_database();
    const templateInfo = await db.query.dbDataset.findFirst({
      where: eq(dbDataset.id, templateName),
    });

    if (templateInfo) {
      templateFile = templateInfo.source;

      // Update the template used
      await db
        .update(dbDataset)
        .set({
          used: sql`${dbDataset.used} + 1`,
        })
        .where(eq(dbDataset.id, templateName));
    }
  }

  return <PlaygroundEditorBody preloadDatabase={templateFile} />;
}

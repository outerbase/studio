import { get_database } from "@/db";
import PlaygroundEditorBody from "./page-client";
import { eq, sql } from "drizzle-orm";
import { dbDataset } from "@/db/schema-dataset";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground - LibSQL Studio",
  description: "SQLite Playground on your browser",
  robots: {
    index: false,
    follow: false,
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

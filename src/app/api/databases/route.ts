import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { db } from "@/db";
import { database } from "@/db/schema";
import withUser from "@/lib/with-user";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const GET = withUser(async ({ user }) => {
  const dbs = await db
    .select()
    .from(database)
    .where(and(eq(database.userId, user.id), isNull(database.deletedAt)))
    .orderBy(desc(database.createdAt));

  return NextResponse.json({
    databases: dbs.map(
      (d) =>
        ({
          id: d.id,
          name: d.name,
          driver: d.driver,
          description: d.description,
          storage: "remote",
          label: d.color,
        } as SavedConnectionItem)
    ),
  });
});

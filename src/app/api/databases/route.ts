import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { db } from "@/db";
import { database } from "@/db/schema";
import withUser from "@/lib/with-user";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = withUser(async ({ user }) => {
  const dbs = await db
    .select()
    .from(database)
    .where(eq(database.userId, user.id));

  return NextResponse.json({
    own_databases: dbs.map(
      (d) =>
        ({
          id: d.id,
          name: d.name,
          description: d.description,
          storage: "remote",
          label: d.color,
        } as SavedConnectionItem)
    ),
  });
});

import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { db } from "@/db";
import { database, database_user_role, user as userTable } from "@/db/schema";
import withUser from "@/lib/with-user";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const GET = withUser(async ({ user }) => {
  const dbs = await db
    .select()
    .from(database_user_role)
    .innerJoin(database, eq(database.id, database_user_role.databaseId))
    .innerJoin(userTable, eq(userTable.id, database.userId))
    .where(
      and(eq(database_user_role.userId, user.id), isNull(database.deletedAt))
    )
    .orderBy(desc(database.createdAt));

  return NextResponse.json({
    databases: dbs.map(
      (d) =>
        ({
          id: d.database.id,
          name: d.database.name,
          driver: d.database.driver,
          description: d.database.description,
          storage: "remote",
          label: d.database.color,
          shared:
            d.database.userId === d.database_user_role.userId
              ? undefined
              : {
                  sharedBy: {
                    id: d.user.id,
                    name: d.user.name,
                  },
                },
        }) as SavedConnectionItem
    ),
  });
});

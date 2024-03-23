import { db } from "@/db";
import { database_role, database_user_role } from "@/db/schema-database";
import { user } from "@/db/schema-user";
import withDatabaseOperation from "@/lib/with-database-ops";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = withDatabaseOperation(async ({ database: databaseInfo }) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      role: {
        id: database_role.id,
        name: database_role.name,
      },
      createdAt: database_user_role.createdAt,
      assignedBy: {
        id: user.id,
        name: user.name,
      },
    })
    .from(database_user_role)
    .innerJoin(user, eq(database_user_role.userId, user.id))
    .innerJoin(database_role, eq(database_user_role.roleId, database_role.id))
    .where(eq(database_user_role.databaseId, databaseInfo.id));

  return NextResponse.json({ users });
});

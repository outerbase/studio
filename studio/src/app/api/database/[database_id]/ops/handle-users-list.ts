import { db } from "@studio/db";
import { user } from "@studio/db/schema";
import { database_role, database_user_role } from "@studio/db/schema-database";
import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { NextResponse } from "next/server";

const handleUserList: DatabaseOperationHandler = async ({
  database: databaseInfo,
}) => {
  const assigned_user = alias(user, "assigned_user");

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
        id: assigned_user.id,
        name: assigned_user.name,
      },
    })
    .from(database_user_role)
    .innerJoin(user, eq(database_user_role.userId, user.id))
    .innerJoin(
      assigned_user,
      eq(database_user_role.createdBy, assigned_user.id)
    )
    .innerJoin(database_role, eq(database_user_role.roleId, database_role.id))
    .where(eq(database_user_role.databaseId, databaseInfo.id));

  return NextResponse.json({ users });
};

export default handleUserList;

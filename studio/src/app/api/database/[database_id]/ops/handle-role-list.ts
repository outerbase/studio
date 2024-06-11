import { get_database } from "@studio/db";
import { database_role } from "@studio/db/schema-database";
import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const handleRoleList: DatabaseOperationHandler = async ({ database }) => {
  const db = get_database();

  const roles = await db.query.database_role.findMany({
    where: eq(database_role.databaseId, database.id),
  });

  return NextResponse.json({
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
    })),
  });
};

export default handleRoleList;

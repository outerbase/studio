import { get_database } from "@/db";
import { database_role } from "@/db/schema-database";
import { DatabaseOperationHandler } from "@/lib/with-database-ops";
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

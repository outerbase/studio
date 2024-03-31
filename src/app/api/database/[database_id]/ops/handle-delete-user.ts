import { HttpStatus } from "@/constants/http-status";
import { db } from "@/db";
import { database_role, database_user_role } from "@/db/schema-database";
import { ApiError } from "@/lib/api-error";
import { RequestDatabaseDeleteUser } from "@/lib/api/api-database-request";
import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const handleDeleteUser: DatabaseOperationHandler<
  RequestDatabaseDeleteUser
> = async ({ database: databaseInfo, body, user, permission }) => {
  const { userId } = body;

  // Validate if user input all fields
  if (!userId)
    throw new ApiError({
      message: "Please provide user and role",
      status: HttpStatus.BAD_REQUEST,
    });

  if (!permission.isOwner) {
    throw new ApiError({
      message: "Only owner can delete other user access",
      status: HttpStatus.FORBIDDEN,
    });
  }

  if (user.id === userId) {
    throw new ApiError({
      message: "Cannot delete yourself",
      status: HttpStatus.FORBIDDEN,
    });
  }

  const isOriginalOwner = user.id === databaseInfo.userId;

  // Check if user already have previous role
  const existingRole = (
    await db
      .select()
      .from(database_user_role)
      .innerJoin(database_role, eq(database_role.id, database_user_role.roleId))
      .where(
        and(
          eq(database_user_role.databaseId, databaseInfo.id),
          eq(database_user_role.userId, userId)
        )
      )
  )[0];

  if (!existingRole) {
    throw new ApiError({
      message: "User does not belong to this database",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  if (existingRole.database_role.isOwner && !isOriginalOwner) {
    throw new ApiError({
      message: "Only original owner can delete other owner",
      status: HttpStatus.FORBIDDEN,
    });
  }

  await db
    .delete(database_user_role)
    .where(
      and(
        eq(database_user_role.databaseId, databaseInfo.id),
        eq(database_user_role.userId, userId)
      )
    );

  return NextResponse.json({ success: true });
};

export default handleDeleteUser;

import { HttpStatus } from "@studio/constants/http-status";
import { db } from "@studio/db";
import { database_role, database_user_role } from "@studio/db/schema-database";
import { user as userTable } from "@studio/db/schema-user";
import { ApiError } from "@studio/lib/api-error";
import { RequestDatabaseAssignUser } from "@studio/lib/api/api-database-request";
import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const handleAssignUser: DatabaseOperationHandler<
  RequestDatabaseAssignUser
> = async ({ database: databaseInfo, body, user, permission }) => {
  const { roleId, userId } = body;

  // Validate if user input all fields
  if (!userId || !roleId)
    throw new ApiError({
      message: "Please provide user and role",
      status: HttpStatus.BAD_REQUEST,
    });

  if (!permission.isOwner) {
    throw new ApiError({
      message: "Only owner can assign other user access",
      status: HttpStatus.FORBIDDEN,
    });
  }

  if (user.id === userId) {
    throw new ApiError({
      message: "Cannot reassign yourself",
      status: HttpStatus.FORBIDDEN,
    });
  }

  // Check if role and user are valid
  const assignedRole = await db.query.database_role.findFirst({
    where: eq(database_role.id, roleId),
  });

  const assignedUser = await db.query.user.findFirst({
    where: eq(userTable.id, userId),
  });

  if (!assignedRole || assignedRole.databaseId !== databaseInfo.id) {
    throw new ApiError({
      message: "Role does not exist in this database",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  if (!assignedUser) {
    throw new ApiError({
      message: "User does not exist",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const isOriginalOwner = user.id === databaseInfo.userId;
  if (assignedRole.isOwner && !isOriginalOwner) {
    throw new ApiError({
      message: "Only original owner can assign other owner",
      status: HttpStatus.FORBIDDEN,
    });
  }

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
    await db.insert(database_user_role).values({
      userId,
      databaseId: databaseInfo.id,
      roleId,
      createdBy: user.id,
      createdAt: Date.now(),
    });
  } else {
    if (existingRole.database_role.isOwner && !isOriginalOwner) {
      throw new ApiError({
        message: "Only original owner can reassign other owner",
        status: HttpStatus.FORBIDDEN,
      });
    }

    await db
      .update(database_user_role)
      .set({ roleId, createdAt: Date.now(), createdBy: user.id })
      .where(
        and(
          eq(database_user_role.databaseId, databaseInfo.id),
          eq(database_user_role.userId, userId)
        )
      );
  }

  return NextResponse.json({ success: true });
};

export default handleAssignUser;

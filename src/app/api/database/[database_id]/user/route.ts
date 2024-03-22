import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import withDatabaseOperation, {
  DatabasePermission,
} from "@/lib/with-database-ops";
import { database_user_role, database_role } from "@/db/schema";
import { db } from "@/db";
import zod from "zod";

export const runtime = "edge";

const assignUserSchema = zod.object({
  user: zod.string(),
  role: zod.string(),
});

const deleteUserSchema = zod.object({
  user: zod.string(),
});

function checkOwnerPermission(permission: DatabasePermission) {
  if (!permission.isOwner) {
    return NextResponse.json(
      {
        success: false,
        error: "You do not have permission",
      },
      { status: 403 }
    );
  }
}

async function getUserRoleInfo(userId: string, databaseId: string) {
  return db.query.database_user_role.findFirst({
    where: and(
      eq(database_user_role.databaseId, databaseId),
      eq(database_user_role.userId, userId)
    ),
    columns: {
      roleId: true,
    },
  });
}

async function checkUserHasOwnerRole(roleId: string) {
  const roleInfo = await db.query.database_role.findFirst({
    where: eq(database_role.id, roleId),
    columns: {
      isOwner: true,
    },
  });
  return roleInfo?.isOwner;
}

export const POST = withDatabaseOperation(
  async ({ user, body, database, permission }) => {
    const parsed = assignUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const permissionError = checkOwnerPermission(permission);
    if (permissionError) {
      return permissionError;
    }

    const { user: userId, role: roleId } = parsed.data;

    const userExists = await db.query.user.findFirst({
      where: (fields, op) => op.eq(fields.id, userId),
    });

    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User does not exist" },
        { status: 404 }
      );
    }

    const roleInfo = await db.query.database_role.findFirst({
      where: (fields) => eq(fields.id, roleId),
      columns: {
        isOwner: true,
        createdBy: true,
      },
    });

    if (roleInfo?.isOwner && database.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Owner cannot reassign other owner" },
        { status: 403 }
      );
    }

    const userRole = await getUserRoleInfo(userId, database.id);

    if (userRole) {
      // Update the role if it exists
      await db
        .update(database_user_role)
        .set({ roleId })
        .where(
          and(
            eq(database_user_role.databaseId, database.id),
            eq(database_user_role.userId, userId)
          )
        );
    } else {
      await db.insert(database_user_role).values({
        userId,
        databaseId: database.id,
        roleId,
        createdBy: user.id,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({ success: true });
  }
);

export const DELETE = withDatabaseOperation(
  async ({ body, database, permission, user }) => {
    const parsed = deleteUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const permissionError = checkOwnerPermission(permission);
    if (permissionError) {
      return permissionError;
    }

    const { user: userId } = parsed.data;

    const userRole = await getUserRoleInfo(userId, database.id);

    if (!userRole || !userRole.roleId) {
      return NextResponse.json(
        { success: false, error: "User is not assigned to this database" },
        { status: 404 }
      );
    }

    const userHasOwnerRole = await checkUserHasOwnerRole(userRole.roleId);

    if (userHasOwnerRole && database.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the database creator can remove an owner",
        },
        { status: 403 }
      );
    }

    await db
      .delete(database_user_role)
      .where(
        and(
          eq(database_user_role.databaseId, database.id),
          eq(database_user_role.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  }
);


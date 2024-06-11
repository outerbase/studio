import {
  DatabaseRoleAccess,
  DatabaseRoleType,
  database,
  database_role,
  database_user_role,
} from "@studio/db/schema";
import { User } from "lucia";
import withUser from "./with-user";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { get_database } from "@studio/db";

export interface DatabasePermission {
  isOwner: boolean;
  canExecuteQuery: boolean;
  roles: {
    type: DatabaseRoleType;
    access: DatabaseRoleAccess;
    tableName: string | null;
    columnName: string | null;
  }[];
}

export type DatabaseOperationHandler<BodyType = unknown> = (props: {
  user: User;
  body: BodyType;
  database: typeof database.$inferSelect;
  permission: DatabasePermission;
}) => Promise<NextResponse>;

export default function withDatabaseOperation<T = unknown>(
  handler: DatabaseOperationHandler<T>
) {
  return withUser<{ params: { database_id: string } }>(
    async ({ user, req, params }) => {
      const databaseId = params.params.database_id;
      const db = get_database();

      if (!databaseId) {
        return NextResponse.json(
          { error: "Database is not provided" },
          { status: 500 }
        );
      }

      const [databaseInfo, databaseRole] = await db.batch([
        db.query.database.findFirst({ where: eq(database.id, databaseId) }),
        db.query.database_user_role.findFirst({
          where: and(
            eq(database_user_role.databaseId, databaseId),
            eq(database_user_role.userId, user.id)
          ),
        }),
      ]);

      if (!databaseInfo || databaseInfo.deletedAt !== null) {
        return NextResponse.json(
          { error: "Database does not exist" },
          { status: 500 }
        );
      }

      const roleId = databaseRole?.roleId;

      if (!roleId) {
        return NextResponse.json(
          { error: "You do not have permission" },
          { status: 500 }
        );
      }

      const permission = await db.query.database_role.findFirst({
        where: eq(database_role.id, roleId),
        with: {
          permissions: true,
        },
      });

      if (!permission) {
        return NextResponse.json(
          { error: "You do not have permission" },
          { status: 500 }
        );
      }

      return await handler({
        user,
        body:
          headers().get("Content-Type") === "application/json"
            ? await req.json()
            : {},
        database: databaseInfo,
        permission: {
          isOwner: !!permission.isOwner,
          canExecuteQuery: !!permission.canExecuteQuery,
          roles: permission.permissions.map((p) => ({
            type: p.type ?? "table",
            access: p.access ?? "read",
            tableName: p.tableName,
            columnName: p.columnName,
          })),
        },
      });
    }
  );
}

import zod from "zod";
import withDatabaseOperation from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import { database } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { encrypt } from "@/lib/encryption";
import { env } from "@/env";
import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";

const databaseSchema = zod.object({
  name: zod.string().min(3).max(50),
  description: zod.string(),
  color: zod.enum(["gray", "red", "yellow", "green", "blue"]),
  config: zod
    .object({
      url: zod.string().min(5).optional(),
      token: zod.string().optional(),
    })
    .optional(),
});

export const GET = withDatabaseOperation(async ({ database: databaseInfo }) => {
  return NextResponse.json({
    id: databaseInfo.id,
    name: databaseInfo.name,
    storage: databaseInfo.driver,
    description: databaseInfo.description,
    label: databaseInfo.color,
  } as SavedConnectionItem);
});

export const DELETE = withDatabaseOperation(
  async ({ database: databaseInfo, permission }) => {
    if (!permission.isOwner) {
      return NextResponse.json({ error: "Unauthorization" }, { status: 500 });
    }

    await db
      .update(database)
      .set({
        deletedAt: Date.now(),
      })
      .where(eq(database.id, databaseInfo.id));

    return NextResponse.json({ success: true });
  }
);

export const PUT = withDatabaseOperation(
  async ({ database: databaseInfo, permission, body }) => {
    const parsed = databaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.formErrors,
        },
        { status: 500 }
      );
    }

    const data = parsed.data;
    const key = Buffer.from(env.ENCRYPTION_KEY, "base64");

    if (!permission.isOwner) {
      return NextResponse.json({ error: "Unauthorization" }, { status: 500 });
    }

    await db
      .update(database)
      .set({
        color: data.color,
        description: data.description,
        name: data.name,
        host: data?.config?.url ? encrypt(key, data.config.url) : undefined,
        token: data?.config?.token
          ? encrypt(key, data.config.token)
          : undefined,
      })
      .where(eq(database.id, databaseInfo.id));

    return NextResponse.json({
      success: true,
    });
  }
);

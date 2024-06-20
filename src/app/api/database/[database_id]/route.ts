import zod from "zod";
import withDatabaseOperation from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import { database } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption-edge";
import { env } from "@/env";
import { SavedConnectionItemConfig } from "@/app/connect/saved-connection-storage";
import { get_database } from "@/db";

export const runtime = "edge";

const databaseSchema = zod.object({
  name: zod.string().min(3).max(50),
  description: zod.string(),
  label: zod.enum(["gray", "red", "yellow", "green", "blue"]),
  config: zod.object({
    url: zod.string().min(5),
    token: zod.string().optional(),
    username: zod.string().optional(),
    password: zod.string().optional(),
  }),
});

export const GET = withDatabaseOperation(async ({ database: databaseInfo }) => {
  return NextResponse.json({
    id: databaseInfo.id,
    driver: databaseInfo.driver ?? "turso",
    name: databaseInfo.name,
    storage: databaseInfo.driver,
    description: databaseInfo.description,
    label: databaseInfo.color,
    config: {
      url: databaseInfo.host,
      token: "",
    },
  } as SavedConnectionItemConfig);
});

export const DELETE = withDatabaseOperation(
  async ({ database: databaseInfo, user }) => {
    const isOriginalOwner = databaseInfo.userId === user.id;
    const db = get_database();

    if (!isOriginalOwner) {
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
  async ({ database: databaseInfo, body, user }) => {
    const parsed = databaseSchema.safeParse(body);
    const db = get_database();

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.formErrors,
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    const isOriginalOwner = databaseInfo.userId === user.id;
    if (!isOriginalOwner) {
      return NextResponse.json({ error: "Unauthorization" }, { status: 500 });
    }

    await db
      .update(database)
      .set({
        color: data.label,
        description: data.description,
        name: data.name,
        host: data.config.url,
        token: data.config.token
          ? await encrypt(env.ENCRYPTION_KEY, data.config.token)
          : undefined,
        username: data.config.username
          ? await encrypt(env.ENCRYPTION_KEY, data.config.username)
          : undefined,
        password: data.config.password
          ? await encrypt(env.ENCRYPTION_KEY, data.config.password)
          : undefined,
      })
      .where(eq(database.id, databaseInfo.id));

    return NextResponse.json({
      success: true,
    });
  }
);

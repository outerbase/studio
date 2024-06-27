import { HttpStatus } from "@/constants/http-status";
import { get_database } from "@/db";
import { dbTempSession } from "@/db/schema";
import { ApiError } from "@/lib/api-error";
import withErrorHandler from "@/lib/with-error-handler";
import { generateId } from "lucia";
import { NextResponse } from "next/server";
import zod from "zod";

export const runtime = "edge";

const tursoSchema = zod.object({
  driver: zod.string(),
  url: zod.string().min(3).max(50),
  token: zod.string(),
  duration: zod.number().optional(),
});

export const POST = withErrorHandler(async ({ req }) => {
  const tempSessionId = generateId(32);
  const now = Math.floor(Date.now() / 1000);
  const db = get_database();

  const body: {
    driver?: string;
    name?: string;
    url?: string;
    token?: string;
    duration?: number;
  } = await req.json();

  if (!body.driver || body.driver !== "turso") {
    throw new ApiError({
      message: "Please provide valid driver",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const redirectUrl = `https://libsqlstudio.com/client/temp_sess?sid=${tempSessionId}`;

  if (body.driver === "turso") {
    const parsedTurso = tursoSchema.safeParse(body);

    if (parsedTurso.error) {
      throw new ApiError({
        message: parsedTurso.error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await db.insert(dbTempSession).values({
      id: tempSessionId,
      name: body.name ?? "Temp Session",
      driver: body.driver,
      credential: JSON.stringify({ url: body.url, token: body.token }),
      createdAt: now,
      expiredAt: now + (body.duration ?? 60 * 60), // default to expire in one hour
    });
  }

  return NextResponse.json({
    redirect: redirectUrl,
  });
});

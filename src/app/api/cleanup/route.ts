import { get_database } from "@/db";
import { dbTempSession } from "@/db/schema";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const GET = async () => {
  const db = get_database();
  const now = Math.floor(Date.now() / 1000);
  await db.delete(dbTempSession).where(lt(dbTempSession.expiredAt, now));

  return NextResponse.json({
    success: true,
  });
};

// This API tracks user behavior by associating each user with a unique device ID.
// The collected data helps enhance user experience, identify and fix bugs,
// and gain insights for improving the product.
//
// All recorded data will be stored in the Starbase Database.

import { cookies } from "next/headers";
import zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { insertTrackingRecord } from "@/lib/api/insert-tracking-record";

const eventBodySchema = zod.object({
  events: zod
    .array(
      zod.object({
        name: zod.string().max(255),
        data: zod.any().optional(),
      })
    )
    .min(1),
});

export const POST = async (req: NextRequest) => {
  // Getting the device id
  const cookieStore = await cookies();

  let deviceId = cookieStore.get("od-id")?.value;

  if (!deviceId) {
    deviceId = crypto.randomUUID();

    cookieStore.set("od-id", deviceId, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });
  }

  // Get the body
  const body = await req.json();
  const validate = eventBodySchema.safeParse(body);

  if (!validate.success) {
    return NextResponse.json({
      success: false,
      error: validate.error.formErrors,
    });
  }

  // Save the event
  await insertTrackingRecord(deviceId, validate.data.events.slice(0, 50));

  return NextResponse.json({
    success: true,
  });
};

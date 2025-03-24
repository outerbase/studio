// This API tracks user behavior by associating each user with a unique device ID.
// The collected data helps enhance user experience, identify and fix bugs,
// and gain insights for improving the product.
//
// All recorded data will be stored in the Starbase Database.

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import zod from "zod";
import { insertTrackingRecord } from "./insert-tracking-record";

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

export const runtime = "edge";

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-od-id",
    },
  });
}

export const POST = async (req: NextRequest) => {
  // Getting the device id
  const headerStore = await headers();
  const deviceId = headerStore.get("x-od-id");

  if (!deviceId) {
    return NextResponse.json({
      success: false,
      error: "Device ID is required",
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

  return NextResponse.json(
    {
      success: true,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-od-id",
      },
    }
  );
};

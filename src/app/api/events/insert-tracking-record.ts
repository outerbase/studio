"use server";

import { StarbaseQuery } from "@/drivers/database/starbasedb";
import { env } from "@/env";
import { generateId } from "@/lib/generate-id";
import { escapeSqlValue } from "@outerbase/sdk-transform";
import { type TrackEventItem } from "../../../lib/tracking";

export async function insertTrackingRecord(
  deviceId: string,
  events: TrackEventItem[]
) {
  if (!env.DATABASE_ANALYTIC_URL || !env.DATABASE_ANALYTIC_AUTH_TOKEN) {
    return {
      success: false,
      error: "Analytics database is not configured",
    };
  }

  const trackingDb = new StarbaseQuery(
    env.DATABASE_ANALYTIC_URL,
    env.DATABASE_ANALYTIC_AUTH_TOKEN
  );

  const sql = [
    "INSERT INTO events(id, created_at, user_id, event_name, event_data) VALUES",
    events
      .map(
        (event) =>
          "(" +
          [
            generateId(),
            Date.now(),
            deviceId,
            event.name,
            JSON.stringify(event.data),
          ]
            .map(escapeSqlValue)
            .join(", ") +
          ")"
      )
      .join(", "),
  ].join("");

  await trackingDb.query(sql);
}

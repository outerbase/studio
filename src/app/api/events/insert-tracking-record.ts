"use server";

import StarbaseDriver from "@/drivers/starbase-driver";
import { env } from "@/env";
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

  const trackingDb = new StarbaseDriver(env.DATABASE_ANALYTIC_URL, {
    Authorization: "Bearer " + env.DATABASE_ANALYTIC_AUTH_TOKEN,
  });

  const sql = [
    "INSERT INTO events(id, created_at, user_id, event_name, event_data) VALUES",
    events
      .map(
        (event) =>
          "(" +
          [
            crypto.randomUUID(),
            Date.now(),
            deviceId,
            event.name,
            JSON.stringify(event.data),
          ]
            .map(trackingDb.escapeValue)
            .join(", ") +
          ")"
      )
      .join(", "),
  ].join("");

  await trackingDb.query(sql);
}

"use client";
import { CloudDriverSupportOnly } from "../cloud-support-only";

export default function LocalMySQLNewBasePage() {
  return <CloudDriverSupportOnly type="postgres" />;
}

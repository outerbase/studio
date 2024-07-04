"use client";
import { useMemo } from "react";
import MyStudio from "@/components/my-studio";
import TemporarySession from "@/components/sidebar/temp-session-countdown";
import FeatureRequestSidebar from "@/components/sidebar/feature-request.tsx";
import RemoteDriver from "@/drivers/remote-driver";

export default function ClientPageBody({
  sessionId,
  name,
  expired,
}: Readonly<{
  sessionId: string;
  name: string;
  expired: number;
}>) {
  const driver = useMemo(() => {
    return new RemoteDriver("temporary", sessionId, "");
  }, [sessionId]);

  const sidebar = useMemo(() => {
    return (
      <>
        <TemporarySession expiredAt={expired} />
        <FeatureRequestSidebar />
      </>
    );
  }, [expired]);

  return (
    <MyStudio
      driver={driver}
      name={name ?? "Temporary Session"}
      color="gray"
      expiredAt={expired}
      sideBarFooterComponent={sidebar}
    />
  );
}

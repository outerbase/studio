import { get_database } from "@/db";
import { dbTempSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import dynamic from "next/dynamic";

const ClientPageBody = dynamic(() => import("./page-client"), {
  ssr: false,
});

export default async function SessionPage({
  searchParams,
}: {
  searchParams: { sid: string };
}) {
  const now = Math.floor(Date.now() / 1000);
  const db = get_database();
  const sessionId = searchParams?.sid;

  const sessionInfo = await db.query.dbTempSession.findFirst({
    where: eq(dbTempSession.id, sessionId),
  });

  if (!sessionInfo) {
    return <div className="p-4">Session Not Found</div>;
  }

  if (now > (sessionInfo.expiredAt ?? 0)) {
    return <div className="p-4">Session Expired</div>;
  }

  return (
    <ClientPageBody
      name={sessionInfo.name ?? "Temporary Session"}
      expired={sessionInfo.expiredAt ?? 0}
      sessionId={sessionId}
    />
  );
}

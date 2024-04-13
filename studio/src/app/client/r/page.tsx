import { SavedConnectionLabel } from "@/app/connect/saved-connection-storage";
import { db } from "@/db";
import { database } from "@/db/schema";
import { getSessionFromCookie } from "@/lib/auth";
import { and, eq, isNotNull } from "drizzle-orm";
import dynamic from "next/dynamic";

const ClientPageBody = dynamic(() => import("./page-client"), {
  ssr: false,
});

export default async function SessionPage({
  searchParams,
}: {
  searchParams: { p: string };
}) {
  const { session } = await getSessionFromCookie();

  if (!session) {
    return <div>Something wrong</div>;
  }

  const databaseId = searchParams?.p;
  const databaseInfo = await db.query.database.findFirst({
    where: and(eq(database.id, databaseId), isNotNull(database.id)),
  });

  if (!databaseInfo) {
    return <div>Not found</div>;
  }

  return (
    <ClientPageBody
      token={session.id}
      config={{
        id: databaseId,
        name: databaseInfo.name ?? "",
        storage: "remote",
        description: databaseInfo.description ?? "",
        label: (databaseInfo.color ?? "blue") as SavedConnectionLabel,
      }}
    />
  );
}

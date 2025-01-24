import type { SavedConnectionLabel } from "@/app/(theme)/connect/saved-connection-storage";
import { get_database } from "@/db";
import { database } from "@/db/schema";
import { getSessionFromCookie } from "@/lib/auth";
import { and, eq, isNotNull } from "drizzle-orm";
import ClientPageBody from "./page-client";
import ClientOnly from "@/components/client-only";

interface RemoteSessionPageProps {
  searchParams: Promise<{ p: string }>;
}

export default async function RemoteSessionPage(props: RemoteSessionPageProps) {
  const searchParams = await props.searchParams;
  const { session } = await getSessionFromCookie();

  if (!session) {
    return <div>Something wrong</div>;
  }

  const db = get_database();
  const databaseId = searchParams?.p;
  const databaseInfo = await db.query.database.findFirst({
    where: and(eq(database.id, databaseId), isNotNull(database.id)),
  });

  if (!databaseInfo) {
    return <div>Not found</div>;
  }

  return (
    <ClientOnly>
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
    </ClientOnly>
  );
}

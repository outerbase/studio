import { getSessionFromCookie } from "@/lib/auth";
import dynamic from "next/dynamic";

const ClientPageBody = dynamic(() => import("./page-client"), {
  ssr: false,
});

export default async function SessionPage() {
  const { session } = await getSessionFromCookie();

  if (!session) {
    return <div>Something wrong</div>;
  }

  return <ClientPageBody token={session.id} name="Hello" />;
}

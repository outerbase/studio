"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookie, LuciaAuth } from "@/lib/auth";

export default async function logout() {
  const { session } = await getSessionFromCookie();

  if (!session) {
    return {};
  }

  const lucia = LuciaAuth.get();

  if (!lucia) {
    return {};
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/");
}

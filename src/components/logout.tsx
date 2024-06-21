"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookie, lucia } from "@/lib/auth";

export default async function logout() {
  const { session } = await getSessionFromCookie();

  if (!session) {
    return {};
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/");
}

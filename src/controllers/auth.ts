import { get_database } from "@/db";
import { user, user_oauth } from "@/db/schema";
import { Provider, lucia } from "@/lib/auth";
import { generateId } from "lucia";
import { cookies, headers } from "next/headers";

interface UserAuth {
  id: string;
  name: string;
  email: string;
}

export const save = async (data: UserAuth, provider: Provider) => {
  const { id, name, email } = data;
  const headerStore = headers();
  const db = get_database();

  const existingUser = await db.query.user_oauth.findFirst({
    where: (field, op) =>
      op.and(op.eq(field.provider, provider), op.eq(field.providerId, id)),
  });

  if (existingUser?.userId) {
    const session = await lucia.createSession(existingUser.userId, {
      auth_id: existingUser.id,
      user_agent: headerStore.get("user-agent"),
    });

    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/connect",
      },
    });
  }

  const userId = generateId(15);
  const authId = generateId(15);

  await db.insert(user).values({ id: userId, name, email });
  await db.insert(user_oauth).values({
    id: authId,
    provider: provider,
    providerId: id,
    userId: userId,
  });

  const session = await lucia.createSession(userId, {
    auth_id: userId,
    user_agent: headerStore.get("user-agent"),
  });

  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
};

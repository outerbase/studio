import { Lucia } from "lucia";
import { GitHub, Google } from "arctic";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import { connection } from "@studio/db";
import { env } from "@studio/env";
import { cache } from "react";
import { cookies, headers } from "next/headers";

export const PROVIDER = {
  GITHUB: "GITHUB",
  GOOGLE: "GOOGLE",
} as const;

type ObjectValues<T> = T[keyof T];

export type Provider = ObjectValues<typeof PROVIDER>;

export const github = new GitHub(
  env.GITHUB_CLIENT_ID ?? "",
  env.GITHUB_CLIENT_SECRET ?? "",
  {
    redirectURI: `${env.BASE_URL}/login/github/callback`,
  }
);

export const google = new Google(
  env.GOOGLE_CLIENT_ID ?? "",
  env.GOOGLE_CLIENT_SECRET ?? "",
  `${env.BASE_URL}/login/google/callback`
);

const adapter = new LibSQLAdapter(connection, {
  user: "user",
  session: "user_session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },

  getUserAttributes(attr) {
    return {
      name: attr.name,
      picture: attr.picture,
      storageUsage: attr.storage_usage,
    };
  },
});

export const getSession = cache(async function () {
  const authorizationHeader = headers().get("authorization");
  let sessionId = lucia.readBearerToken(authorizationHeader ?? "");

  if (!sessionId) {
    sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  }

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  return await lucia.validateSession(sessionId);
});

export const getSessionFromBearer = cache(async function () {
  const authorizationHeader = headers().get("authorization");
  const sessionId = lucia.readBearerToken(authorizationHeader ?? "");

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  return await lucia.validateSession(sessionId);
});

export const getSessionFromCookie = cache(async function () {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    // eslint-disable-next-line no-empty
  } catch {}
  return result;
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  name: string;
  picture: string;
  storage_usage: number;
}

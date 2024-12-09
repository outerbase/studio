import { Lucia } from "lucia";
import { GitHub, Google } from "arctic";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import { get_connection } from "@/db";
import { env } from "@/env";
import { cache } from "react";
import { NextApiRequest } from "next";
import { cookies, headers } from "next/headers";

export const PROVIDER = {
  GITHUB: "GITHUB",
  GOOGLE: "GOOGLE",
} as const;

type ObjectValues<T> = T[keyof T];

export type Provider = ObjectValues<typeof PROVIDER>;

export const github = (req: NextApiRequest) => {
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "http";
  const baseUrl = `${proto}://${req.headers.host}`;

  return new GitHub(
    env.GITHUB_CLIENT_ID ?? "",
    env.GITHUB_CLIENT_SECRET ?? "",
    {
      redirectURI: `${baseUrl}/login/github/callback`,
    }
  );
};

export const google = (req: NextApiRequest) => {
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "http";
  const baseUrl = `${proto}://${req.headers.host}`;

  return new Google(
    env.GOOGLE_CLIENT_ID ?? "",
    env.GOOGLE_CLIENT_SECRET ?? "",
    `${baseUrl}/login/google/callback`
  );
};

export class LuciaAuth {
  static app?: Lucia<
    Record<never, never>,
    {
      name: string;
      picture: string;
      storageUsage: number;
    }
  >;

  static get() {
    if (!env.DATABASE_URL) return null;
    if (LuciaAuth.app) return LuciaAuth.app;

    const adapter = new LibSQLAdapter(get_connection(), {
      user: "user",
      session: "user_session",
    });

    const lucia = new Lucia(adapter, {
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

    LuciaAuth.app = lucia;
    return lucia;
  }
}

export const getSession = cache(async function () {
  const lucia = LuciaAuth.get();
  if (!lucia) {
    return {
      user: null,
      session: null,
    };
  }

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
  const lucia = LuciaAuth.get();
  if (!lucia) {
    return {
      user: null,
      session: null,
    };
  }

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
  const lucia = LuciaAuth.get();
  if (!lucia) {
    return {
      user: null,
      session: null,
    };
  }

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
    Lucia: Lucia<
      Record<never, never>,
      {
        name: string;
        picture: string;
        storageUsage: number;
      }
    >;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  name: string;
  picture: string;
  storage_usage: number;
}

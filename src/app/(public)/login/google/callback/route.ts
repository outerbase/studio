import { PROVIDER, google } from "@/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import * as AuthController from "@/controllers/auth";
import { NextApiHandler } from "next";

export const GET: NextApiHandler = async (request) => {
  const url = new URL(request.url!);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    cookies().get("google_oauth_code_verifier")?.value ?? null;
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const token = await google(request).validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const resp = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await resp.json();

    await AuthController.save(
      {
        id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
      },
      PROVIDER.GOOGLE
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.error(e);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

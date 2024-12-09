import { google } from "@/lib/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { NextApiHandler } from "next";
import { cookies } from "next/headers";

export const GET: NextApiHandler = async (req) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google(req).createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  cookies().set("google_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookies().set("google_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
};

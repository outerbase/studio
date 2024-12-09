import { github } from "@/lib/auth";
import { generateState } from "arctic";
import { NextApiHandler } from "next";
import { cookies } from "next/headers";

export const GET: NextApiHandler = async (req) => {
  const state = generateState();
  const url = await github(req).createAuthorizationURL(state, {
    scopes: ["user:email"],
  });

  cookies().set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
};

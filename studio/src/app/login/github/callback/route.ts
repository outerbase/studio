import { PROVIDER, github } from "@studio/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import * as AuthController from "@studio/controllers/auth";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const GITHUB_API_URL = "https://api.github.com";

  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const token = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    if (githubUser.email === null) {
      const resp = await fetch(`${GITHUB_API_URL}/user/emails`, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });
      const githubEmails: GitHubEmail[] = await resp.json();
      githubUser.email =
        githubEmails.find((email) => email.primary)?.email || null;
    }

    await AuthController.save(
      {
        id: githubUser.id,
        name: githubUser.login,
        email: githubUser.email || "",
      },
      PROVIDER.GITHUB
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
}

interface GitHubUser {
  id: string;
  login: string;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private";
}

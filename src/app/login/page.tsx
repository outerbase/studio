"use server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { env } from "@/env";
import Link from "next/link";

export default async function LoginPage() {
  const GOOGLE_LOGIN_SUPPORT = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET;
  const GITHUB_LOGIN_SUPPORT = env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET;

  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="w-[300px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Sign In</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            {GITHUB_LOGIN_SUPPORT && (
              <Button asChild>
                <Link href="/login/github">Continue with Github</Link>
              </Button>
            )}

            {GOOGLE_LOGIN_SUPPORT && (
              <Button asChild>
                <Link href="/login/google">Continue with Google</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

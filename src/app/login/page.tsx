"use server";
import LogoLoading from "@/components/gui/logo-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { env } from "@/env";
import Link from "next/link";

export default async function LoginPage() {
  const GOOGLE_LOGIN_SUPPORT = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET;
  const GITHUB_LOGIN_SUPPORT = env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET;

  return (
    <div className="flex h-screen w-screen dark flex-col lg:flex-row">
      <div className="lg:w-1/2 h-full bg-black flex justify-center items-center order-2">
        <div className="text-white max-w-[500px] flex flex-col gap-4 text-lg">
          <LogoLoading />

          <p className="text-xl italic text-yellow-500 font-semibold">
            Unlock the full potential
          </p>

          <p>
            LibSQL Studio is free and doesn't require login. However, logged-in
            users get extra features:
          </p>

          <ul className="list-disc ml-8 leading-8">
            <li>
              Remote storage and{" "}
              <span className="border-b-2 border-yellow-500">
                syncing of connections
              </span>{" "}
              and saved queries across devices
            </li>
            <li>
              Database connection{" "}
              <span className="border-b-2 border-yellow-500">
                sharing and collaboration
              </span>
            </li>
            <li>Attachment uploads</li>
            <li>More features coming soon</li>
          </ul>
        </div>
      </div>
      <div className="lg:w-1/2 h-full flex justify-center items-center bg-white order-1">
        <div className="w-[300px] flex flex-col gap-4 text-lg">
          <p className="font-mono">Login to your account</p>

          {GITHUB_LOGIN_SUPPORT && (
            <Link
              prefetch={false}
              href="/login/github"
              className="border-2 border-black rounded-lg p-4 flex gap-4 items-center font-bold hover:bg-gray-200 text-black"
            >
              <svg
                width="98"
                height="96"
                viewBox="0 0 98 96"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                  fill="currentColor"
                />
              </svg>
              Continue with Github
            </Link>
          )}

          {GOOGLE_LOGIN_SUPPORT && (
            <Link
              prefetch={false}
              href="/login/google"
              className="border-2 border-black rounded-lg p-4 flex gap-4 items-center font-bold hover:bg-gray-200 text-black"
            >
              <img src="/google.png" className="w-6 h-6" />
              Continue with Google
            </Link>
          )}
        </div>
      </div>
      {/* <div className="w-[300px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Sign In</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            {GITHUB_LOGIN_SUPPORT && (
              <Button asChild>
                <Link prefetch={false} href="/login/github">
                  Continue with Github
                </Link>
              </Button>
            )}

            {GOOGLE_LOGIN_SUPPORT && (
              <Button asChild>
                <Link prefetch={false} href="/login/google">
                  Continue with Google
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

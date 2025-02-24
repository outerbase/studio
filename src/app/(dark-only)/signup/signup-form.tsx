"use client";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import {
  registerOuterbaseByPassword,
  verifyOuterbaseRequestEmail,
} from "@/outerbase-cloud/api";
import {
  OuterbaseAPIError,
  OuterbaseAPISession,
} from "@/outerbase-cloud/api-type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<OuterbaseAPISession>();

  const onRegisterClicked = useCallback(() => {
    setLoading(true);

    registerOuterbaseByPassword(email, password)
      .then((session) => {
        localStorage.setItem("ob-token", session.token);
        localStorage.setItem("session", JSON.stringify({ ...session, email }));
        //Alway error 403
        verifyOuterbaseRequestEmail().then(() => {
          setLoading(false);
          localStorage.setItem("continue-redirect", "/signup?verify=true");
          setSession(session);
        });
      })
      .catch((e) => {
        setLoading(false);
        if (e instanceof OuterbaseAPIError) {
          setError(e.description);
        }
      });
  }, [email, password]);

  useEffect(() => {
    if (!session) return;

    const redirect = localStorage.getItem("continue-redirect");
    if (redirect) {
      router.push(redirect);
      return;
    }

    router.push("/");
  }, [session, router]);

  return (
    <div
      className="absolute left-[10%] z-2 w-[400px]"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <div className="flex flex-col gap-4 rounded-lg border-neutral-800 bg-neutral-900 p-8 md:m-0">
        <div className="mb-8 flex flex-col items-center text-white">
          <svg
            fill="currentColor"
            viewBox="75 75 350 350"
            className="mb-2 h-14 w-14 text-black dark:text-white"
          >
            <path d="M249.51,146.58c-58.7,0-106.45,49.37-106.45,110.04c0,60.68,47.76,110.04,106.45,110.04 c58.7,0,106.46-49.37,106.46-110.04C355.97,195.95,308.21,146.58,249.51,146.58z M289.08,332.41l-0.02,0.04l-0.51,0.65 c-5.55,7.06-12.37,9.35-17.11,10.02c-1.23,0.17-2.5,0.26-3.78,0.26c-12.94,0-25.96-9.09-37.67-26.29 c-9.56-14.05-17.84-32.77-23.32-52.71c-9.78-35.61-8.67-68.08,2.83-82.74c5.56-7.07,12.37-9.35,17.11-10.02 c13.46-1.88,27.16,6.2,39.64,23.41c10.29,14.19,19.22,33.83,25.12,55.32C301,285.35,300.08,317.46,289.08,332.41z"></path>
          </svg>

          <h1 className="text-2xl font-bold">Create your Account</h1>
          <p>Sign up to get started with Outerbase</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col gap-4"
        >
          <LabelInput
            autoFocus
            label="Work Email"
            size="lg"
            value={email}
            placeholder="Enter your email address"
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <LabelInput
            label="Password"
            size="lg"
            value={password}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          {error && <div className="text-red-400">{error}</div>}

          <Button
            loading={loading}
            onClick={onRegisterClicked}
            variant="primary"
            size="lg"
            className="justify-center"
          >
            Continue with email
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link
            className="text-neutral-300 transition delay-75 ease-in-out hover:text-neutral-100"
            href={"/signin"}
          >
            Sign In
          </Link>
        </div>
      </div>
      <div className="mt-4 w-[400px] text-center text-sm text-neutral-500">
        By signing up, you agree to our
        <br />
        <Link
          className="text-neutral-300 hover:text-white"
          target="_blank"
          href="https://outerbase.com/terms"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="text-neutral-300 hover:text-white"
          target="_blank"
          href="https://outerbase.com/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

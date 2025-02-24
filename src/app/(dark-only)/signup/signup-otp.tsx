"use client";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import { verifyOuterbaseSubmitEmail } from "@/outerbase-cloud/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function SignupOtp() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");

  const onVerifyOTP = useCallback(() => {
    if (code.length < 6) return;
    setLoading(true);
    verifyOuterbaseSubmitEmail(code)
      .then(() => {
        localStorage.removeItem("continue-redirect");
        router.push("/");
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
      });
  }, [code, router]);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (!session) return;
    const user = JSON.parse(session);
    setEmail(user.email);
  }, []);

  return (
    <div
      className="absolute left-[10%] z-2 flex w-[400px] flex-col gap-4 rounded-lg border-neutral-800 bg-neutral-900 p-8 md:m-0"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <div className="mb-8 flex flex-col items-center text-white">
        <svg
          fill="currentColor"
          viewBox="75 75 350 350"
          className="mb-2 h-14 w-14 text-black dark:text-white"
        >
          <path d="M249.51,146.58c-58.7,0-106.45,49.37-106.45,110.04c0,60.68,47.76,110.04,106.45,110.04 c58.7,0,106.46-49.37,106.46-110.04C355.97,195.95,308.21,146.58,249.51,146.58z M289.08,332.41l-0.02,0.04l-0.51,0.65 c-5.55,7.06-12.37,9.35-17.11,10.02c-1.23,0.17-2.5,0.26-3.78,0.26c-12.94,0-25.96-9.09-37.67-26.29 c-9.56-14.05-17.84-32.77-23.32-52.71c-9.78-35.61-8.67-68.08,2.83-82.74c5.56-7.07,12.37-9.35,17.11-10.02 c13.46-1.88,27.16,6.2,39.64,23.41c10.29,14.19,19.22,33.83,25.12,55.32C301,285.35,300.08,317.46,289.08,332.41z"></path>
        </svg>

        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-center text-base text-neutral-300">
          We&apos;ve sent a link to {email ?? ""}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          onVerifyOTP();
          e.preventDefault();
        }}
        className="flex flex-col gap-4"
      >
        <LabelInput
          required
          label="Verification code"
          size="lg"
          value={code}
          placeholder="XXXXXX"
          onChange={(e) => setCode(e.currentTarget.value)}
        />

        {error && <div className="text-red-400">{error}</div>}

        <Button
          disabled={code.length < 6}
          loading={loading}
          onClick={onVerifyOTP}
          variant="primary"
          size="lg"
          className="justify-center"
        >
          Verify
        </Button>
      </form>

      <div className="text-center font-sans text-sm">
        Still having trouble?{" "}
        <Link
          href="mailto:hello@outerbase.com"
          className="text-primary border-b"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}

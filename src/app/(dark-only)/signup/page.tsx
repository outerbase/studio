"use client";
import { useSearchParams } from "next/navigation";
import { LoginBaseSpaceship } from "../signin/starbase-portal";
import { SignupForm } from "./signup-form";
import { SignupOtp } from "./signup-otp";

//https://app.outerbase.com/api/v1/auth/register
export default function SignupPage() {
  const searchParams = useSearchParams();

  const verify = searchParams.get("verify") === "true";

  return (
    <>
      {verify ? <SignupOtp /> : <SignupForm />}
      <LoginBaseSpaceship />
    </>
  );
}

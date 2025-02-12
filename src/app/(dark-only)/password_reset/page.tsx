"use client";
import OuterbaseLogo from "@/components/icons/outerbase";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/orbit/label";
import { isValidEmail } from "@/lib/validation";
import {
  requestResetPassword,
  resetPassword,
} from "@/outerbase-cloud/api-account";
import { SendHorizonal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PasswordResetPage() {
  const param = useSearchParams();
  const router = useRouter();
  const reset_token = param.get("reset_token");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSent, setIsSent] = useState(false);

  const onResetPassword = useCallback(() => {
    if (!reset_token) return;
    setLoading(true);
    resetPassword({
      password,
      reset_token,
    })
      .then(() => {
        toast.success("Your password has been reseted");
        router.replace("/signin");
      })
      .catch((error) => {
        setLoading(false);
        toast.error(`Error: ${error.message}`);
      });
  }, [password, reset_token, router]);

  const onRequestResetPassword = useCallback(() => {
    setLoading(true);
    requestResetPassword({ email })
      .then(() => setIsSent(true))
      .catch((error) => {
        setLoading(false);
        toast.error(`Error: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [email]);

  const { title, description } = useMemo(() => {
    let title, description;

    if (isSent) {
      title = "Check your email";
      description = "We've sent a reset link to";
    } else if (reset_token) {
      title = "Choose a new password";
      description = "Enter a new password for your account.";
    } else {
      title = "Reset your password";
      description = `Enter the email address you log in to Outerbase with, and we’ll email you a link to reset your password.`;
    }

    return { title, description };
  }, [isSent, reset_token]);

  return (
    <div className="flex h-[100vh]">
      <div className="bg-right-[20vh] flex h-full w-full flex-col overflow-hidden bg-neutral-950 bg-gradient-to-r bg-[url('/assets/reset-password-orb.webp')] from-neutral-950 from-70% to-neutral-900 bg-[60vw] bg-no-repeat">
        <div className="flex items-start p-8" />
        <div className="items start flex flex-1">
          <div className="flex h-full flex-1 items-center">
            <div className="m-auto w-full max-w-md p-8">
              <div className="align-left items-start pb-12">
                <Link href="#">
                  <OuterbaseLogo className="h-6" />
                </Link>
              </div>
              <div className="flex flex-col items-start gap-5">
                <div className="text-3xl font-medium text-white">{title}</div>
                <div className="flex flex-row items-center gap-2">
                  {isSent && <SendHorizonal />}

                  <p className="text-base text-neutral-400">
                    {description}
                    {isSent && (
                      <span>
                        <br />
                        {email}
                      </span>
                    )}
                  </p>
                </div>
                {(!isSent || reset_token) && (
                  <>
                    <Label
                      title={reset_token ? "Password" : "Email"}
                      required
                      className="text-white"
                    >
                      <Input
                        value={reset_token ? password : email}
                        placeholder={
                          reset_token ? "Enter password" : "Enter email address"
                        }
                        type={reset_token ? "password" : "email"}
                        onValueChange={reset_token ? setPassword : setEmail}
                      />
                    </Label>
                    <Button
                      shape="base"
                      loading={loading}
                      onClick={
                        reset_token ? onResetPassword : onRequestResetPassword
                      }
                      disabled={reset_token ? !password : !isValidEmail(email)}
                      title={
                        reset_token
                          ? "Confirm new password"
                          : "Sent Password Reset Email"
                      }
                      variant="primary"
                    />
                  </>
                )}

                <div className="font-sans text-sm">
                  Still having trouble?{" "}
                  <Link href="mailto:hello@outerbase.com" className="border-b">
                    Contact support
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}

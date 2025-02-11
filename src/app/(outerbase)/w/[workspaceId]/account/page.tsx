"use client";
import { NavigationBar } from "@/app/(outerbase)/nav";
import { useSession } from "@/app/(outerbase)/session-provider";
import { Button } from "@/components/orbit/button";
import TwoFactorAuth from "./two-factor-auth";
import UserAvatar from "./user-avatar";
import UserFormInput from "./user-form-input";

export default function AccountPage() {
  const { session } = useSession();

  if (!session?.user) return <div>You are not login!</div>;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <main className="mx-auto mt-20 mb-32 flex max-w-sm flex-col">
        <div className="flex flex-col gap-5">
          <h1 className="text-primary text-xl font-bold">Account Setting</h1>
          <h2 className="mt-5 text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
            Details
          </h2>

          <UserAvatar user={session.user} />
          <UserFormInput user={session.user} />
          <TwoFactorAuth />
        </div>
        <div className="flex flex-col items-start gap-2">
          <h2 className="mt-5 text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
            Delete Account
          </h2>
          <div className="text-base">
            This will delete your account and all the workspaces you own.
          </div>
          <Button
            className="mt-5"
            title="Delete Account"
            variant="destructive"
            size="lg"
          />
        </div>
      </main>
    </div>
  );
}

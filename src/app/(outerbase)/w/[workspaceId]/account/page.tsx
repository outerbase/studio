"use client";
import { NavigationBar } from "@/app/(outerbase)/nav";
import { useSession } from "@/app/(outerbase)/session-provider";
import AccountFooter from "./account-footer";
import TwoFactorAuth from "./two-factor-auth";
import UserAvatar from "./user-avatar";
import UserFormInput from "./user-form-input";

export default function AccountPage() {
  const { session } = useSession();

  if (!session?.user) return <div>You are not login!</div>;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <main className="mx-auto flex max-w-sm flex-col overflow-x-hidden overflow-y-auto pt-20 pb-10">
        <div className="flex flex-col gap-5">
          <h1 className="text-primary text-2xl font-bold">Account Setting</h1>
          <h2 className="mt-5 text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
            Details
          </h2>
          <UserAvatar user={session.user} />
          <UserFormInput user={session.user} />
          <TwoFactorAuth />
          <AccountFooter />
        </div>
      </main>
    </div>
  );
}

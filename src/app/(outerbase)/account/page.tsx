"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import NavigationLayout from "../nav-layout";
import AccountFooter from "./account-footer";
import TwoFactorAuth from "./two-factor-auth";
import UserAvatar from "./user-avatar";
import UserFormInput from "./user-form-input";

export default function AccountPage() {
  const { session } = useSession();

  if (!session?.user) return <div>You are not login!</div>;

  return (
    <NavigationLayout>
      <main className="flex max-w-sm flex-col p-8">
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
    </NavigationLayout>
  );
}

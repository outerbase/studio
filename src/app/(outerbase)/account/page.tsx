"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import { Loader } from "@/components/orbit/loader";
import { OuterbaseAPIUser } from "@/outerbase-cloud/api-type";
import NavigationLayout from "../nav-layout";
import AccountFooter from "./account-footer";
import TwoFactorAuth from "./two-factor-auth";
import UserAvatar from "./user-avatar";
import UserFormInput from "./user-form-input";

function AccountPageBody({ user }: { user: OuterbaseAPIUser }) {
  return (
    <>
      <h2 className="mt-5 text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
        Details
      </h2>
      <UserAvatar user={user} />
      <UserFormInput user={user} />
      <TwoFactorAuth />
      <AccountFooter />
    </>
  );
}

export default function AccountPage() {
  const { session } = useSession();

  return (
    <NavigationLayout>
      <main className="flex max-w-sm flex-col p-8">
        <div className="flex flex-col gap-5">
          <h1 className="text-primary text-2xl font-bold">Account Setting</h1>

          {session?.user ? (
            <AccountPageBody user={session.user} />
          ) : (
            <Loader size={30} />
          )}
        </div>
      </main>
    </NavigationLayout>
  );
}

import { useSession } from "@/app/(outerbase)/session-provider";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/orbit/label";
import {
  updateOuterbaseUserPassword,
  updateOuterbaseUserProfile,
} from "@/outerbase-cloud/api-account";
import { OuterbaseAPIUser } from "@/outerbase-cloud/api-type";
import { produce } from "immer";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: OuterbaseAPIUser;
}

export default function UserFormInput({ user }: Props) {
  const { refreshSession } = useSession();
  const [loading, setLoading] = useState<
    "user_profile" | "login_method" | undefined
  >();
  const [userData, setUserData] = useState<OuterbaseAPIUser>(user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const updateUserProfile = useCallback(() => {
    setLoading("user_profile");
    updateOuterbaseUserProfile({
      first_name: userData.first_name,
      last_name: userData.last_name,
    })
      .then(() => {
        toast.success("Profile updated");
        refreshSession();
      })
      .catch((error) => {
        toast.error(error?.message);
      })
      .finally(() => {
        setLoading(undefined);
      });
  }, [userData, refreshSession]);

  const updateUserPassword = useCallback(() => {
    setLoading("login_method");
    updateOuterbaseUserPassword({
      new_password: newPassword,
      old_password: currentPassword,
    })
      .then(() => {
        toast.success("Password updated");
        refreshSession();
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => {
        setLoading(undefined);
      });
  }, [newPassword, currentPassword, refreshSession]);

  return (
    <div className="flex flex-col items-start gap-5">
      <Label title="First Name" htmlFor="first_name">
        <Input
          value={userData?.first_name}
          onValueChange={(v) => {
            setUserData((prev) =>
              produce(prev, (draft) => {
                draft.first_name = v;
              })
            );
          }}
          placeholder="First name..."
          id="first_name"
          size="lg"
        />
      </Label>
      <Label title="Last Name" htmlFor="last_name">
        <Input
          value={userData?.last_name}
          onValueChange={(v) => {
            setUserData((prev) =>
              produce(prev, (draft) => {
                draft.last_name = v;
              })
            );
          }}
          placeholder="Last name..."
          id="last_name"
          size="lg"
        />
      </Label>
      <Button
        loading={loading === "user_profile"}
        title="Update"
        onClick={updateUserProfile}
        size="lg"
        shape="base"
        disabled={!userData.first_name || !userData.last_name}
      />
      <h2 className="mt-6 text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
        Login method
      </h2>
      <Label title="Email" htmlFor="email">
        <Input
          value={user.email}
          placeholder="Enter email..."
          id="email"
          disabled
          size="lg"
        />
      </Label>
      <Label title="Current password" htmlFor="currentpassword">
        <Input
          value={currentPassword}
          onValueChange={setCurrentPassword}
          id="currentpassword"
          size="lg"
          type="password"
        />
      </Label>
      <Label title="New Password" htmlFor="lastname">
        <Input
          value={newPassword}
          id="lastname"
          size="lg"
          onValueChange={setNewPassword}
          type="password"
        />
      </Label>

      <Button
        loading={loading === "login_method"}
        disabled={!newPassword || !currentPassword}
        title="Update"
        size="lg"
        onClick={updateUserPassword}
      />
    </div>
  );
}

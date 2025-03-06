"use client";
import { useSession } from "@/app/(outerbase)/session-provider";
import CopyableText from "@/components/copyable-text";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/orbit/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isValidEmail } from "@/lib/validation";
import { deleteOuterbaseUser } from "@/outerbase-cloud/api-account";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AccountFooter() {
  const { session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setOpen(false);
    setEmail("");
    setLoading(false);
  };

  const onDeleteOuerbaseUser = useCallback(() => {
    setLoading(true);
    deleteOuterbaseUser()
      .then(() => {
        onClose();
        router.push("/signout");
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.message);
      });
  }, [router]);

  const fullName = useMemo(() => {
    if (!session) return;
    return session?.user.first_name + " " + session?.user.last_name;
  }, [session]);

  const disabled = useMemo(() => {
    return !isValidEmail(email) || email !== session?.user.email;
  }, [email, session]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <DialogContent className="justify-items-start">
          <DialogHeader>
            <DialogTitle>
              Confirm deletion of {fullName}&apos; account
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="text-base">
            Deleting this account will delete all Bases and Workspaces and
            revoke all connections made to your databases. All members will lose
            access. This action is permanent and{" "}
            <span className="text-primary font-medium italic">cannot</span> be
            undone.
          </DialogDescription>

          <CopyableText text={session?.user.email ?? ""} />

          <Label title="Enter your email address to confirm:">
            <Input
              value={email}
              type="email"
              onValueChange={setEmail}
              placeholder="Enter email address"
            />
          </Label>
          <div className="flex flex-row gap-5">
            <Button
              loading={loading}
              disabled={disabled}
              onClick={onDeleteOuerbaseUser}
              variant="destructive"
              shape="base"
              title="I understand, delete my account"
            />
            <Button variant="secondary" onClick={onClose} title="Cancel" />
          </div>
        </DialogContent>
      </Dialog>
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
          onClick={() => setOpen(true)}
        />
      </div>
    </>
  );
}

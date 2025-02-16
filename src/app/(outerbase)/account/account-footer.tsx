import { useSession } from "@/app/(outerbase)/session-provider";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/orbit/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { isValidEmail } from "@/lib/validation";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

export default function AccountFooter() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  const copyToClipboard = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session?.user.email);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  const onClose = () => {
    setCopied(false);
    setOpen(false);
    setEmail("");
  };
  const fullName = useMemo(() => {
    if (!session) return;
    return session?.user.first_name + " " + session?.user.last_name;
  }, [session]);

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
          <DialogTitle>
            Confirm deletion of {fullName}&apos; account
          </DialogTitle>
          <DialogDescription className="text-base">
            Deleting this account will delete all Bases and Workspaces and
            revoke all connections made to your databases. All members will lose
            access. This action is permanent and{" "}
            <span className="text-primary font-medium italic">cannot</span> be
            undone.
          </DialogDescription>
          <Button onClick={copyToClipboard}>
            {session?.user.email}
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
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
              disabled={!isValidEmail(email)}
              onClick={onClose}
              variant="destructive"
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

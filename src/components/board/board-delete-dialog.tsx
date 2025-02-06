import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DashboardProps } from ".";
import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface Props {
  onClose?: () => void;
  onDelete: () => void;
  value: DashboardProps;
}

export function BoardDeleteDialog(props: Props) {
  const [nameInput, setNameInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) setCopied(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [copied]);

  const onClickCopy = useCallback(() => {
    setCopied(true);
    navigator.clipboard.writeText(props.value.name);
  }, [props.value.name]);

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm deletion of {props.value.name}</DialogTitle>
          <DialogDescription className="py-4">
            Deleting this chart will remove it from your dashboard. All members
            will lose access. This action is permanent and cannot be undone.
          </DialogDescription>
          <div>
            <button
              className={buttonVariants({ size: "sm", variant: "secondary" })}
              onClick={onClickCopy}
            >
              <div className="flex flex-row items-center gap-2">
                <div>{props.value.name}</div>
                <div className="relative h-4 w-4">
                  <Copy
                    className={`${copied ? "hidden" : ""} absolute h-4 w-4`}
                  />
                  <Check
                    className={`${!copied ? "hidden" : ""} absolute h-4 w-4`}
                  />
                </div>
              </div>
            </button>
            <div className="pt-4 pb-2 text-xs">
              Enter the name of this Chart to confirm:
            </div>
            <Input
              value={nameInput}
              onChange={(v) => setNameInput(v.target.value)}
            />
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant={"destructive"}
            disabled={nameInput !== props.value.name}
            onClick={props.onDelete}
          >
            I understand, delete my chart
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

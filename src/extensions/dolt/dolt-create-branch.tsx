import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStudioContext } from "@/context/driver-provider";
import { GitBranch, Loader } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function useDoltCreateBranchModal(refreshStatus: () => void) {
  const { databaseDriver } = useStudioContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [branchName, setBranchName] = useState<string>();
  const [commitHash, setCommitHash] = useState<string | undefined>();

  const onSaveClicked = useCallback(() => {
    const command = commitHash
      ? `CALL DOLT_CHECKOUT('-b', ${databaseDriver.escapeValue(branchName)}, ${databaseDriver.escapeValue(commitHash)});`
      : `CALL DOLT_CHECKOUT('-b', ${databaseDriver.escapeValue(branchName)});`;

    setLoading(true);
    databaseDriver
      .query(command)
      .then(() => {
        refreshStatus();
        setOpen(false);
      })
      .catch((e) => {
        setLoading(false);
        if (e instanceof Error) {
          setErrorMessage(e.message);
        } else {
          setErrorMessage("An error occurred");
        }
      });
  }, [databaseDriver, refreshStatus, commitHash, branchName]);

  const modal = useMemo(() => {
    if (!open) return null;

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {commitHash ? (
              <>
                Creating new branch from{" "}
                <span className="bg-muted inline-flex rounded px-2 font-mono">
                  {commitHash}
                </span>
              </>
            ) : (
              "Creating new branch"
            )}
          </DialogDescription>

          {errorMessage && (
            <div className="py-2 font-mono text-red-500">{errorMessage}</div>
          )}

          <div>
            <Input
              value={branchName}
              placeholder="Branch Name"
              onChange={(e) => setBranchName(e.currentTarget.value)}
            />
          </div>

          <DialogFooter>
            <Button disabled={!branchName || loading} onClick={onSaveClicked}>
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitBranch className="mr-2 h-4 w-4" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [open, branchName, commitHash, onSaveClicked, loading, errorMessage]);

  const openModal = (commitHash?: string) => {
    setCommitHash(commitHash);
    setBranchName("");
    setLoading(false);
    setOpen(true);
    setErrorMessage(undefined);
  };

  return { modal, openModal };
}

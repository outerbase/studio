import { createDialog } from "@/components/create-dialog";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAgentFromLocalStorage,
  updateAgentFromLocalStorage,
} from "@/lib/ai-agent-storage";
import { useCallback, useEffect, useState } from "react";

export const localSettingDialog = createDialog(({ close }) => {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const agentData = getAgentFromLocalStorage();
    if (!agentData) return;

    setToken(agentData.token);
  }, []);

  const onSaveClicked = useCallback(() => {
    updateAgentFromLocalStorage({
      provider: "openai",
      model: "gpt-4o-mini",
      token,
    });

    close(undefined);
  }, [token, close]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Local Setting</DialogTitle>

        <DialogDescription>
          Bring your OpenAI token to enable the AI assistant. Your token is
          stored in localStorage. We do not store your token on our server.
        </DialogDescription>
      </DialogHeader>

      <LabelInput
        type="password"
        label="Token"
        placeholder="Token"
        size="lg"
        value={token}
        onValueChange={setToken}
      />

      <DialogFooter>
        <Button size="lg" variant="primary" onClick={onSaveClicked}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
});

"use client";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import {
  getAgentFromLocalStorage,
  updateAgentFromLocalStorage,
} from "@/lib/ai-agent-storage";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import NavigationLayout from "../nav-layout";

export default function LocalSettingPage() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const agentData = getAgentFromLocalStorage();
    if (!agentData) return;

    setToken(agentData.token);
  }, []);

  const onSaveClicked = useCallback(() => {
    if (!token) return;

    updateAgentFromLocalStorage({
      provider: "openai",
      model: "gpt-4o-mini",
      token,
    });

    toast("Setting saved!");
  }, [token]);

  return (
    <NavigationLayout>
      <div className="flex max-w-[600px] flex-col gap-4 p-8">
        <h1 className="text-xl font-bold">Local Setting</h1>

        <p className="text-base">
          Bring your OpenAI token to enable the AI assistant. Your token is
          stored in localStorage. We do not store your token on our server.
        </p>

        <LabelInput
          type="password"
          label="Token"
          placeholder="Token"
          size="lg"
          value={token}
          onValueChange={setToken}
        />

        <div>
          <Button size="lg" variant="primary" onClick={onSaveClicked}>
            Save
          </Button>
        </div>
      </div>
    </NavigationLayout>
  );
}

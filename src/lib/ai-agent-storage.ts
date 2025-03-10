import AgentDriverList from "@/drivers/agent/list";
import { BaseDriver } from "@/drivers/base-driver";
import { useMemo } from "react";
import useSWR, { mutate } from "swr";

export interface LocalAgentType {
  provider: "openai";
  model: "gpt-4o-mini";
  token: string;
}

export function getAgentFromLocalStorage(): LocalAgentType | undefined {
  if (typeof window === "undefined") return undefined;

  // Getting the driver from the local storage
  const agentRawData = localStorage.getItem("agent");
  if (!agentRawData) return undefined;

  // Parsing the agent data
  const agentData: LocalAgentType = JSON.parse(agentRawData);

  // Validate the data
  if (agentData.provider !== "openai") return undefined;
  if (agentData.model !== "gpt-4o-mini") return undefined;
  if (!agentData.token) return undefined;

  return agentData;
}

export function updateAgentFromLocalStorage(data: LocalAgentType) {
  localStorage.setItem("agent", JSON.stringify(data));
  mutate("/local-agent-setting", data);
}

export function useAvailableAIAgents(databaseDriver?: BaseDriver | null) {
  const { data: agentConfig } = useSWR(
    "/local-agent-setting",
    getAgentFromLocalStorage
  );

  return useMemo(() => {
    if (!databaseDriver) return undefined;
    return new AgentDriverList(databaseDriver, agentConfig?.token);
  }, [databaseDriver, agentConfig]);
}

import { CloudflareIcon } from "@/components/icons/outerbase-icon";
import { ReactElement } from "react";
import { BaseDriver } from "../base-driver";
import { AgentBaseDriver, AgentPromptOption } from "./base";
import { ChatGPTDriver } from "./chatgpt";
import CloudflareAgentDriver from "./cloudflare";

interface AgentDriverListItem {
  name: string;
  free?: boolean;
  available: boolean;
}

interface AgentDriverListGroup {
  name: string;
  title: ReactElement | string;
  agents: AgentDriverListItem[];
}

const DEFAULT_FREE_TIER_MODEL = "llama-3.3-70b";

export default class AgentDriverList {
  protected dict: Record<string, AgentBaseDriver | undefined> = {};
  protected defaultModelName: string | undefined;

  constructor(databaseDriver: BaseDriver, token?: string) {
    this.dict = {
      "llama-3.3-70b": new CloudflareAgentDriver(
        databaseDriver,
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
      ),

      "sqlcoder-7b-2": new CloudflareAgentDriver(
        databaseDriver,
        "@cf/defog/sqlcoder-7b-2"
      ),

      "gpt-4o mini": token
        ? new ChatGPTDriver(databaseDriver, token)
        : undefined,
    };

    this.defaultModelName =
      localStorage.getItem("default-agent-model") ?? DEFAULT_FREE_TIER_MODEL;
  }

  setDefaultModelName(name: string) {
    this.defaultModelName = name;
    localStorage.setItem("default-agent-model", name);
  }

  getDefaultModelName(): string {
    return this.defaultModelName || "gemma-2b-it-lora";
  }

  list(): AgentDriverListGroup[] {
    return [
      {
        name: "cloudflare",
        title: (
          <div className="flex items-center gap-1">
            Powered by{" "}
            <CloudflareIcon className="inline-flex h-4 w-4 text-orange-500" />
            Cloudflare Workers AI
          </div>
        ),
        agents: [
          {
            name: "llama-3.3-70b",
            free: true,
            available: !!this.dict["llama-3.3-70b"],
          },
          {
            name: "sqlcoder-7b-2",
            free: true,
            available: !!this.dict["sqlcoder-7b-2"],
          },
        ],
      },
      {
        name: "other",
        title: "Bring your own model",
        agents: [
          { name: "gpt-4o mini", available: !!this.dict["gpt-4o mini"] },
        ],
      },
    ];
  }

  async run(
    modelName: string,
    message: string,
    sessionId: string | undefined,
    options: AgentPromptOption
  ): Promise<string> {
    const driver = this.dict[modelName];

    if (!driver) {
      throw new Error(`Selected model ${modelName} is not available`);
    }

    return await driver.run(message, sessionId, options);
  }
}

import { format } from "sql-formatter";
import { BaseDriver } from "../base-driver";
import CommonAgentDriverImplementation, { CommonAgentMessage } from "./common";

export default class CloudflareAgentDriver extends CommonAgentDriverImplementation {
  constructor(
    protected driver: BaseDriver,
    protected model:
      | "@cf/defog/sqlcoder-7b-2"
      | "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  ) {
    super(driver);
  }

  async query(messages: CommonAgentMessage[]): Promise<string> {
    const response = await fetch(
      "https://studio-ai-agent.outerbase.workers.dev/chat/complete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
        }),
      }
    );

    const jsonResponse = (await response.json()) as { response: string };
    return jsonResponse.response;
  }

  processResult(result: string): string {
    if (this.model === "@cf/defog/sqlcoder-7b-2") {
      return format(result, {
        language: "sqlite",
      });
    }

    return super.processResult(result);
  }
}

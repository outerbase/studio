import { DatabaseSchemas } from "../base-driver";

export interface AgentPromptOption {
  schema?: DatabaseSchemas;
  selectedSchema?: string;
  selected: string;
}

export interface AgentPromptResponse {
  result: string;
  id: string;
}

export abstract class AgentBaseDriver {
  /**
   *
   * @param message User message
   * @param previousId Previous message id. If not provided, it is a new conversation
   * @param option
   */
  abstract run(
    message: string,
    previousId: string | undefined,
    option: AgentPromptOption
  ): Promise<string>;
}

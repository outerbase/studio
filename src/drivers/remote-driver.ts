import {
  ApiOpsBatchResponse,
  ApiOpsQueryResponse,
} from "@/lib/api-response-types";
import { RequestOperationBody } from "@/lib/api/api-request-types";
import { SqliteLikeBaseDriver } from "./sqlite-base-driver";

export default class RemoteDriver extends SqliteLikeBaseDriver {
  protected id: string = "";
  protected authToken = "";
  protected type: "temporary" | "remote" = "remote";

  constructor(type: "temporary" | "remote", id: string, authToken: string) {
    super();
    this.id = id;
    this.authToken = authToken;
    this.type = type;
  }

  close(): void {
    // do nothing
  }
  protected async request<T = unknown>(body: RequestOperationBody) {
    const url =
      this.type === "temporary"
        ? `/api/temp_ops/${this.id}`
        : `/api/ops/${this.id}`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await r.json();
    if (json?.error) throw new Error(json.error);

    return json as T;
  }

  async query(stmt: string) {
    const r = await this.request<ApiOpsQueryResponse>({
      type: "query",
      statement: stmt,
    });

    return r.data;
  }

  async transaction(stmt: string[]) {
    const r = await this.request<ApiOpsBatchResponse>({
      type: "batch",
      statements: stmt,
    });

    return r.data;
  }
}

import { InStatement } from "@libsql/client/web";
import {
  BaseDriver,
  DatabaseResultSet,
  DatabaseSchemaItem,
  DatabaseTableOperation,
  DatabaseTableOperationReslt,
  DatabaseTableSchema,
  DatabaseTriggerSchema,
  SelectFromTableOptions,
} from "@/drivers/base-driver";
import {
  ApiOpsBatchResponse,
  ApiOpsQueryResponse,
  ApiSchemaListResponse,
  ApiSchemaResponse,
  ApiTriggerResponse,
} from "@/lib/api-response-types";
import { RequestOperationBody } from "@/lib/api/api-request-types";

export default class RemoteDriver implements BaseDriver {
  protected id: string = "";
  protected authToken = "";
  protected type: "temporary" | "remote" = "remote";

  constructor(type: "temporary" | "remote", id: string, authToken: string) {
    this.id = id;
    this.authToken = authToken;
    this.type = type;
  }

  supportBigInt(): boolean {
    return false;
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

  async query(stmt: InStatement) {
    const r = await this.request<ApiOpsQueryResponse>({
      type: "query",
      statement: stmt,
    });

    return r.data;
  }

  async transaction(stmt: InStatement[]) {
    const r = await this.request<ApiOpsBatchResponse>({
      type: "batch",
      statements: stmt,
    });

    return r.data;
  }

  close() {}

  async schemas(): Promise<DatabaseSchemaItem[]> {
    return (await this.request<ApiSchemaListResponse>({ type: "schemas" }))
      .data;
  }

  async tableSchema(tableName: string): Promise<DatabaseTableSchema> {
    return (
      await this.request<ApiSchemaResponse>({ type: "schema", tableName })
    ).data;
  }

  async trigger(name: string): Promise<DatabaseTriggerSchema> {
    return (await this.request<ApiTriggerResponse>({ type: "trigger", name }))
      .data;
  }

  async updateTableData(
    tableName: string,
    ops: DatabaseTableOperation[]
  ): Promise<DatabaseTableOperationReslt[]> {
    return await this.request({
      type: "update-table-data",
      ops,
      tableName,
    });
  }

  async selectTable(
    tableName: string,
    options: SelectFromTableOptions
  ): Promise<{ data: DatabaseResultSet; schema: DatabaseTableSchema }> {
    return await this.request({
      type: "select-table",
      tableName,
      options,
    });
  }
}

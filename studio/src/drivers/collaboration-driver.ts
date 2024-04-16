import { RequestDatabaseBody } from "@studio/lib/api/api-database-request";
import {
  ApiRole,
  ApiRolesResponse,
  ApiUserListResponse,
  ApiUserRole,
} from "@studio/lib/api/api-database-response";
import { CollaborationDriver } from "@libsqlstudio/gui/driver";

export default class Collaborator implements CollaborationDriver {
  protected id: string = "";
  protected authToken = "";

  constructor(id: string, authToken: string) {
    this.id = id;
    this.authToken = authToken;
  }

  protected async request<T = unknown>(body: RequestDatabaseBody) {
    const r = await fetch(`/api/database/${this.id}/ops`, {
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

  async getRoles(): Promise<ApiRole[]> {
    return (await this.request<ApiRolesResponse>({ type: "roles" })).roles;
  }

  async getUsers(): Promise<ApiUserRole[]> {
    return (await this.request<ApiUserListResponse>({ type: "users" })).users;
  }

  async assignUser(userId: string, roleId: string) {
    await this.request({ type: "assign-user", roleId, userId });
  }

  async deleteUser(userId: string) {
    await this.request({ type: "delete-user", userId });
  }
}

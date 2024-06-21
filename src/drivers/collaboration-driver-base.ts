import { ApiRole, ApiUserRole } from "@/lib/api/api-database-response";

export abstract class CollaborationBaseDriver {
  abstract getRoles(): Promise<ApiRole[]>;
  abstract getUsers(): Promise<ApiUserRole[]>;
  abstract assignUser(userId: string, roleId: string): Promise<void>;
  abstract deleteUser(userId: string): Promise<void>;
}

import { ApiRole, ApiUserRole } from "@/libs/api-database-response";

export default abstract class CollaborationDriver {
  abstract getRoles(): Promise<ApiRole[]>;
  abstract getUsers(): Promise<ApiUserRole[]>;
  abstract assignUser(userId: string, roleId: string): Promise<void>;
  abstract deleteUser(userId: string): Promise<void>;
}

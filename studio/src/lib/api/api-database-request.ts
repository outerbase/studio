export interface RequestDatabaseRoleList {
  type: "roles";
}

export interface RequestDatabaseUserList {
  type: "users";
}

export interface RequestDatabaseAssignUser {
  type: "assign-user";
  roleId: string;
  userId: string;
}

export interface RequestDatabaseDeleteUser {
  type: "delete-user";
  userId: string;
}

export type RequestDatabaseBody =
  | RequestDatabaseRoleList
  | RequestDatabaseUserList
  | RequestDatabaseAssignUser
  | RequestDatabaseDeleteUser;

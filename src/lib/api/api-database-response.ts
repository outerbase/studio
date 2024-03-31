export interface ApiRole {
  id: string;
  name: string;
}

export interface ApiUser {
  id: string;
  name: string;
}

export interface ApiUserRole {
  id: string;
  name: string;
  role: ApiRole;
  createdAt: number;
  assignedBy: ApiUser;
}

export interface ApiRolesResponse {
  roles: ApiRole[];
}

export interface ApiUserListResponse {
  users: ApiUserRole[];
}

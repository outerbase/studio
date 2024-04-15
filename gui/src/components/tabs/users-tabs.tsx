import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gui/components/ui/select";
import { Avatar, AvatarFallback } from "@gui/components/ui/avatar";
import { Input } from "@gui/components/ui/input";
import { Button } from "@gui/components/ui/button";
import { LucideTrash } from "lucide-react";
import { useDatabaseDriver } from "@gui/contexts/driver-provider";
import { ApiRole, ApiUserRole } from "@gui/lib/api-database-response";

function RoleSelect({
  roles,
  value,
  onChange,
}: Readonly<{
  roles: ApiRole[];
  value?: string;
  onChange?: (value: string) => void;
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder="Roles" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function UsersTab() {
  const { collaborationDriver } = useDatabaseDriver();

  const [roleList, setRoleList] = useState<ApiRole[]>([]);
  const [userRoleList, setUserRoleList] = useState<ApiUserRole[]>([]);

  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState<string>();

  const refetch = useCallback(() => {
    if (collaborationDriver) {
      collaborationDriver.getUsers().then(setUserRoleList).catch(console.error);
      collaborationDriver.getRoles().then(setRoleList).catch(console.error);
    }
  }, [collaborationDriver]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onAddUser = useCallback(() => {
    if (roleId && userId && collaborationDriver) {
      collaborationDriver
        .assignUser(userId, roleId)
        .then(() => {
          refetch();
          setRoleId(undefined);
          setUserId("");
        })
        .catch(console.error);
    }
  }, [userId, roleId, collaborationDriver, refetch]);

  const onDeleteUser = useCallback(
    (userId: string) => {
      if (collaborationDriver && userId) {
        collaborationDriver
          .deleteUser(userId)
          .then(refetch)
          .catch(console.error);
      }
    },
    [collaborationDriver, refetch]
  );

  const onRoleChange = useCallback(
    (userId: string, newRoleId: string) => {
      if (collaborationDriver) {
        collaborationDriver.assignUser(userId, newRoleId).then(refetch).catch();
      }
    },
    [collaborationDriver, refetch]
  );

  return (
    <div className="py-4 px-8">
      <h1 className="font-bold">{`Users & Permission`}</h1>

      <div className="mt-8 rounded border max-w-[600px]">
        <div className="flex p-3 items-center gap-2 border-b bg-secondary">
          <div className="grow">
            <Input
              placeholder="User ID"
              className="bg-background"
              value={userId}
              onChange={(e) => setUserId(e.currentTarget.value)}
            />
          </div>
          <div className="w-[150px]">
            <RoleSelect roles={roleList} value={roleId} onChange={setRoleId} />
          </div>
          <div className="w-[100px]">
            <Button className="w-full" onClick={onAddUser}>
              Add User
            </Button>
          </div>
        </div>

        {userRoleList.map((user) => {
          return (
            <div key={user.id} className="flex p-3 items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grow flex flex-col text-sm">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs">
                  Created by {user.assignedBy.name} on{" "}
                  {new Date(user.createdAt).toDateString()}
                </div>
              </div>
              <div className="w-[150px]">
                <RoleSelect
                  roles={roleList}
                  value={user.role.id}
                  onChange={(newRoleId) => onRoleChange(user.id, newRoleId)}
                />
              </div>
              <div>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <LucideTrash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

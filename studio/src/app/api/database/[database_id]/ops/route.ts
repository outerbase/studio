import { NextResponse } from "next/server";
import withDatabaseOperation from "@studio/lib/with-database-ops";
import { RequestDatabaseBody } from "@studio/lib/api/api-database-request";
import handleRoleList from "./handle-role-list";
import handleUserList from "./handle-users-list";
import handleAssignUser from "./handle-assign-user";
import handleDeleteUser from "./handle-delete-user";

export const runtime = "edge";

export const POST = withDatabaseOperation<RequestDatabaseBody>(
  async function (props) {
    const body = props.body;

    if (body.type === "roles") {
      return await handleRoleList(props);
    } else if (body.type === "users") {
      return await handleUserList(props);
    } else if (body.type === "assign-user") {
      return await handleAssignUser({ ...props, body });
    } else if (body.type === "delete-user") {
      return await handleDeleteUser({ ...props, body });
    }

    return NextResponse.json({ error: "Unknown command" }, { status: 500 });
  }
);

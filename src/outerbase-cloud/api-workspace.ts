import { requestOuterbase } from "./api";
import { OuterbaseAPIWorkspace } from "./api-type";

export function createOuterbaseWorkspace(options: {
  short_name: string;
  name: string;
}) {
  return requestOuterbase<OuterbaseAPIWorkspace>(
    "/api/v1/workspace",
    "POST",
    options
  );
}

export function updateOuterbaseWorkspace(
  workspaceId: string,
  options: { short_name: string; name: string }
) {
  return requestOuterbase(`/api/v1/workspace/${workspaceId}`, "PUT", options);
}

export function deleteOuterbaseWorkspace(workspaceId: string) {
  return requestOuterbase(`/api/v1/workspace/${workspaceId}`, "DELETE");
}

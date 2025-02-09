import { requestOuterbase } from "./api";

export function updateOuterbaseWorkspace(
  workspaceId: string,
  options: { short_name: string; name: string }
) {
  return requestOuterbase(`/api/v1/workspace/${workspaceId}`, "PUT", options);
}

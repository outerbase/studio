import { requestOuterbase } from "./api";
import {
  OuterbaseAPIBase,
  OuterbaseAPISource,
  OuterbaseAPISourceInput,
  OuterbaseAPIWorkspace,
} from "./api-type";

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

export function createOuterbaseBase(workspaceId: string, name: string) {
  return requestOuterbase<OuterbaseAPIBase>(
    `/api/v1/workspace/${workspaceId}/base`,
    "POST",
    {
      name,
    }
  );
}

export function createOuterbaseSource(
  workspaceId: string,
  baseId: string,
  source: OuterbaseAPISourceInput
) {
  return requestOuterbase<OuterbaseAPISource>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/source`,
    "POST",
    source
  );
}

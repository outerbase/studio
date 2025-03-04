import { mutate } from "swr";
import { requestOuterbase } from "./api";
import {
  OuterbaseAPIBase,
  OuterbaseAPIBaseCredential,
  OuterbaseAPIConnection,
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

export function createOuterbaseConnection(
  workspaceId: string,
  baseId: string,
  name: string
) {
  return requestOuterbase<OuterbaseAPIConnection>(
    `/api/v1/workspace/${workspaceId}/connection`,
    "POST",
    {
      name,
      baseId,
    }
  );
}

export function testOuterbaseSource(
  workspaceId: string,
  source: OuterbaseAPISourceInput
) {
  return requestOuterbase(
    `/api/v1/workspace/${workspaceId}/source/credential/test`,
    "POST",
    source
  );
}

export function updateOuterbaseSource(
  workspaceId: string,
  sourceId: string,
  source: OuterbaseAPISourceInput
) {
  return requestOuterbase<OuterbaseAPISource>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}`,
    "PUT",
    source
  );
}

export function createOuterbaseSource(
  workspaceId: string,
  source: OuterbaseAPISourceInput
) {
  return requestOuterbase<OuterbaseAPISource>(
    `/api/v1/workspace/${workspaceId}/source`,
    "POST",
    source
  );
}

export async function updateOuterbaseSchemas(
  workspaceId: string,
  sourceId: string
) {
  return await requestOuterbase<unknown>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/schema?baseId=`,
    "POST"
  );
}

export async function getOuterbaseBaseCredential(
  workspaceId: string,
  sourceId: string
) {
  return await requestOuterbase<OuterbaseAPIBaseCredential>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/credential`,
    "GET"
  );
}

export async function updateOuterbaseCredential(
  workspaceId: string,
  sourceId: string,
  source: OuterbaseAPISourceInput
) {
  mutate("/source/${sourceId}/credential");

  return await requestOuterbase<OuterbaseAPISourceInput>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}`,
    "PUT",
    source
  );
}

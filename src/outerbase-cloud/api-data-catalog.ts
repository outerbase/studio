import { requestOuterbase } from "./api";
import {
  OuterbaseAPIResponse,
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogDefinition,
  OuterbaseDataCatalogResponse,
  OuterbaseDataCatalogSchemas,
  OuterbaseDataCatalogVirtualColumnInput,
  OuterbaseDefinitionInput,
} from "./api-type";

export async function getOuterbaseSchemas(
  workspaceId: string,
  sourceId: string
) {
  // 
  return await requestOuterbase<Record<string, OuterbaseDataCatalogSchemas[]>>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/schema?baseId=`
  );
}

export async function getOuterbaseBaseComments(
  workspaceId: string,
  sourceId: string,
  baseId: string,
  size: number = 1000
) {
  return await requestOuterbase<
    OuterbaseDataCatalogResponse<OuterbaseDataCatalogComment[]>
  >(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment?size=${size}&baseId=${baseId}`
  );
}

export async function getOuterbaseDefinitions(
  workspaceId: string,
  baseId: string
) {
  return await requestOuterbase<
    OuterbaseDataCatalogResponse<OuterbaseDataCatalogDefinition[]>
  >(`/api/v1/workspace/${workspaceId}/base/${baseId}/definition`);
}

export async function updateOuerbaseDefinition(
  workspaceId: string,
  baseId: string,
  definitionId: string,
  data: OuterbaseDefinitionInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogDefinition>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition/${definitionId}`,
    "PUT",
    data
  );

  return result;
}
export async function createOuterbaseDefinition(
  workspaceId: string,
  baseId: string,
  data: OuterbaseDefinitionInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogDefinition>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition`,
    "POST",
    {
      base_id: baseId,
      ...data,
    }
  );

  return result;
}

export async function deleteOuterbaseDefinition(
  workspaceId: string,
  baseId: string,
  definitionId: string
) {
  const result = await requestOuterbase<OuterbaseAPIResponse>(
    `/api/v1/workspace/${workspaceId}/base/${baseId}/definition/${definitionId}`,
    "DELETE"
  );

  return result;
}

export async function updateOuterbaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  commentId: string,
  data: OuterbaseDataCatalogVirtualColumnInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogComment>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment/${commentId}`,
    "PUT",
    data
  );

  return result;
}

export async function createOuterbaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  data: OuterbaseDataCatalogVirtualColumnInput
) {
  const result = await requestOuterbase<OuterbaseDataCatalogComment>(
    `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment`,
    "POST",
    data
  );

  return result;
}

export async function deleteOutebaseDataCatalogVirtualColumn(
  workspaceId: string,
  sourceId: string,
  commentId: string
) {
  try {
    await requestOuterbase<boolean>(
      `/api/v1/workspace/${workspaceId}/source/${sourceId}/comment/${commentId}`,
      "DELETE"
    );
    return true;
  } catch {
    return false;
  }
}

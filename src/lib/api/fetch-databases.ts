import { ApiDatabasesResponse } from "../api-response-types";

export default async function fetchDatabases(): Promise<ApiDatabasesResponse> {
  const result = await fetch("/api/databases");
  return await result.json();
}

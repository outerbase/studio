import withDatabaseOperation from "@/lib/with-database-ops";
import { RequestOperationBody } from "@/lib/api/api-request-types";
import { databaseOperationHandler } from "./handler";

export const runtime = "edge";

export const POST = withDatabaseOperation<RequestOperationBody>(
  databaseOperationHandler
);

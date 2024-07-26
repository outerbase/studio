import { RequestOperationBody } from "@/lib/api/api-request-types";
import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import handleBatchRequest from "./handle-batch";
import handleQueryRequest from "./handle-query";
import handleSchemasRequest from "./handle-schemas";
import handleSelectTableRequest from "./handle-select-table";
import handleUpdateTableDataRequest from "./handle-update-table-data";
import handleSchemaRequest from "./handle-schema";
import handleTriggerRequest from "./handle-trigger";
import { NextResponse } from "next/server";
import handleFindFirst from "./handle-find-first";

export const databaseOperationHandler: DatabaseOperationHandler<
  RequestOperationBody
> = async (props) => {
  const body = props.body;

  if (body.type === "batch") {
    return await handleBatchRequest({ ...props, body });
  } else if (body.type === "query") {
    return await handleQueryRequest({ ...props, body });
  } else if (body.type === "schemas") {
    return await handleSchemasRequest(props);
  } else if (body.type === "select-table") {
    return await handleSelectTableRequest({ ...props, body });
  } else if (body.type === "find-first") {
    return await handleFindFirst({ ...props, body });
  } else if (body.type === "update-table-data") {
    return await handleUpdateTableDataRequest({ ...props, body });
  } else if (body.type === "schema") {
    return await handleSchemaRequest({ ...props, body });
  } else if (body.type === "trigger") {
    return await handleTriggerRequest({ ...props, body });
  }

  return NextResponse.json({ error: "Unknown command" }, { status: 500 });
};

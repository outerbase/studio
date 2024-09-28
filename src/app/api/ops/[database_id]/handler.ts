import { RequestOperationBody } from "@/lib/api/api-request-types";
import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import handleBatchRequest from "./handle-batch";
import handleQueryRequest from "./handle-query";
import { NextResponse } from "next/server";

export const databaseOperationHandler: DatabaseOperationHandler<
  RequestOperationBody
> = async (props) => {
  const body = props.body;

  if (body.type === "batch") {
    return await handleBatchRequest({ ...props, body });
  } else if (body.type === "query") {
    return await handleQueryRequest({ ...props, body });
  }

  return NextResponse.json({ error: "Unknown command" }, { status: 500 });
};

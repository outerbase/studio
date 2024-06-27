import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./api-error";
import { HttpStatus } from "@/constants/http-status";

type WithErrorHandler<T = unknown> = (props: {
  req: NextRequest;
  params: T;
}) => Promise<NextResponse>;

export default function withErrorHandler<ParamsType = unknown>(
  handler: WithErrorHandler<ParamsType>
) {
  return async function (req: NextRequest, params: ParamsType) {
    try {
      return await handler({ req, params });
    } catch (e) {
      // TODO: can extract this to a separate function
      if (e instanceof ApiError) {
        return new Response(
          JSON.stringify({
            message: e.message,
            detailedMessage: e.detailedMessage,
          }),
          { status: e.status }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Something went wrong",
          detailedMessage: e instanceof Error ? e.message : "Unknown Error",
        }),
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

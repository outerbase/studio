import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";
import { Session, User } from "lucia";
import { ApiError } from "./api-error";
import { HttpStatus } from "@/constants/http-status";

type WithUserHandler<T = unknown> = (props: {
  req: NextRequest;
  user: User;
  session: Session;
  params: T;
}) => Promise<NextResponse>;

export default function withUser<ParamsType = unknown>(
  handler: WithUserHandler<ParamsType>,
) {
  return async function (req: NextRequest, params: ParamsType) {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: HttpStatus.UNAUTHORIZED });
    }

    const user = session.user;
    const sess = session.session;

    if (!user || !sess) {
      return new Response("Unauthorized", { status: HttpStatus.UNAUTHORIZED });
    }

    try {
      return await handler({ req, user, session: sess, params });
    } catch (e) {
      if (e instanceof ApiError) {
        return new Response(
          JSON.stringify({
            message: e.message,
            detailedMessage: e.detailedMessage,
          }),
          { status: e.status },
        );
      }

      return new Response(
        JSON.stringify({
          message: "Something went wrong",
          detailedMessage: e instanceof Error ? e.message : "Unknown Error",
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
      );
    }
  };
}

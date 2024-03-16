import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "./auth";
import { Session, User } from "lucia";

type WithUserHandler = (props: {
  req: NextRequest;
  res: NextResponse;
  user: User;
  session: Session;
}) => Promise<NextResponse>;

export default function withUser(handler: WithUserHandler) {
  return async function (req: NextRequest, res: NextResponse) {
    const session = await getSessionFromCookie();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = session.user;
    const sess = session.session;

    if (!user || !sess) {
      return new Response("Unauthorized", { status: 401 });
    }

    return await handler({ req, res, user, session: sess });
  };
}

import { HttpStatus } from "@/constants/http-status";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const headerStore = await headers();

  // Get the account id and database id from header
  const accountId = headerStore.get("x-account-id");

  if (!accountId) {
    return NextResponse.json(
      {
        error: "Please provide account id or database id",
      },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  const authorizationHeader = headerStore.get("Authorization");
  if (!authorizationHeader) {
    return NextResponse.json(
      {
        error: "Please provide authorization header",
      },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "text/plain",
      },
      body: await req.text(),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: await response.text(),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (e) {
    return NextResponse.json(
      {
        error: (e as Error).message,
      },
      { status: HttpStatus.BAD_REQUEST }
    );
  }
}

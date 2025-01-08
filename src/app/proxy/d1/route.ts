import { HttpStatus } from "@/constants/http-status";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const headerStore = await headers();

  // Get the account id and database id from header
  const accountId = headerStore.get("x-account-id");
  const databaseId = headerStore.get("x-database-id");

  if (!accountId || !databaseId) {
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
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/raw`;

    const response: { errors: { message: string }[] } = await (
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(await req.json()),
      })
    ).json();

    if (response.errors && response.errors.length > 0) {
      return NextResponse.json(
        {
          error: response.errors[0].message,
        },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      {
        error: (e as Error).message,
      },
      { status: HttpStatus.BAD_REQUEST }
    );
  }
}

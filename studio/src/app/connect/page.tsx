import { Metadata } from "next";
import { getSessionFromCookie } from "@/lib/auth";
import ConnectBody from "./page-client";

export const metadata: Metadata = {
  title: "LibSQL Studio",
  description: "LibSQL Studio",
};

export default async function Home() {
  const { user } = await getSessionFromCookie();

  return <ConnectBody user={user} />;
}

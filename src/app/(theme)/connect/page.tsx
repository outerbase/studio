import { Metadata } from "next";
import { getSessionFromCookie } from "@/lib/auth";
import ConnectBody from "./page-client";
import ThemeLayout from "../theme_layout";
import { WEBSITE_NAME } from "@/const";

export const metadata: Metadata = {
  title: WEBSITE_NAME,
  description: WEBSITE_NAME,
};

export default async function Home() {
  const { user } = await getSessionFromCookie();

  return (
    <ThemeLayout>
      <ConnectBody user={user} />
    </ThemeLayout>
  );
}

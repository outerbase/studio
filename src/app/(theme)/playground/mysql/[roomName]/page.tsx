import ClientOnly from "@/components/client-only";
import { Metadata } from "next";
import ThemeLayout from "../../../theme_layout";
import MySQLPlaygroundPageClient from "./page-client";

export const metadata: Metadata = {
  title:
    "SQLite Online Playground - Powerful and lightweight editor on your browser",
  description:
    "Explore the powerful SQLite Playground in your browser – no downloads or registration needed. Effortlessly load your SQLite files or start with a blank database, then save your work with ease. Enjoy a robust data editor, advanced query capabilities, table creation, and much more.",
  keywords: [
    "sqlite",
    "libsql",
    "browser",
    "client",
    "gui",
    "playground",
    "sandbox",
    "explorer",
    "studio",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const runtime = "edge";

interface MySQLPlaygroundProps {
  params: Promise<{ roomName: string }>;
}

export default async function MySQLPlaygroundEditor(
  props: MySQLPlaygroundProps
) {
  const { roomName } = await props.params;

  return (
    <ThemeLayout>
      <ClientOnly>
        <MySQLPlaygroundPageClient roomName={roomName} />
      </ClientOnly>
    </ThemeLayout>
  );
}

import ClientOnly from "@/components/client-only";
import { Metadata } from "next";
import ThemeLayout from "../../theme_layout";
import PlaygroundEditorBody from "./page-client";

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

interface PlaygroundEditorProps {
  searchParams: Promise<{ template?: string; url?: string }>;
}

export default async function PlaygroundEditor(props: PlaygroundEditorProps) {
  const searchParams = await props.searchParams;
  const templateName = searchParams.template;
  let templateFile: string | null = null;

  // We will hardcode the template given that we already removed the database
  // but we want to keep the template working.

  if (templateName) {
    if (templateName === "chinook") {
      templateFile = "https://r2.invisal.com/sample/chinook.db";
    } else if (templateName === "northwind") {
      templateFile = "https://r2.invisal.com/sample/northwind.db";
    }
  } else if (searchParams.url) {
    templateFile = searchParams.url;
  }

  return (
    <ThemeLayout>
      <ClientOnly>
        <PlaygroundEditorBody preloadDatabase={templateFile} />
      </ClientOnly>
    </ThemeLayout>
  );
}

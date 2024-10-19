import type { Metadata } from "next";

import "./globals.css";
import "./inter-font.css";
import "./codemirror-override.css";
import { Fragment } from "react";
import { WEBSITE_NAME } from "@/const";

const siteDescription = `${WEBSITE_NAME} is a fully-featured, lightweight GUI client for managing SQLite-based databases like Turso, LibSQL, and rqlite. It runs entirely in your browser, so there's no need to download anything`;

export const metadata: Metadata = {
  title: WEBSITE_NAME,
  keywords: [
    "libsql",
    "rqlite",
    "sqlite",
    "studio",
    "browser",
    "editor",
    "gui",
    "online",
    "client",
  ],
  description: siteDescription,
  openGraph: {
    siteName: WEBSITE_NAME,
    description: siteDescription,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Fragment>{children}</Fragment>
    </html>
  );
}

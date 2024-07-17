import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "./codemirror-override.css";

import ThemeProvider from "@/context/theme-provider";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { Fragment } from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const siteDescription =
  "LibSQL Studio is a fully-featured, lightweight GUI client for managing SQLite-based databases like Turso, LibSQL, and rqlite. It runs entirely in your browser, so there's no need to download anything";

export const metadata: Metadata = {
  title: "LibSQL Studio",
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
    siteName: "LibSQL Studio",
    description: siteDescription,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme={theme}>
          <Fragment>{children}</Fragment>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <Script async defer src="https://buttons.github.io/buttons.js" />
      </body>
    </html>
  );
}

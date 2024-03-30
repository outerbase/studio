import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ThemeProvider from "@/context/theme-provider";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { Fragment } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibSQL Studio",
  description: "",
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
        {process.env.ENABLE_ANALYTIC && (
          <Script async defer src="https://scripts.withcabin.com/hello.js" />
        )}
        <ThemeProvider defaultTheme={theme}>
          <Fragment>{children}</Fragment>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

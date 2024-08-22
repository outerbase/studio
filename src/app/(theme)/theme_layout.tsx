import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import ThemeProvider from "@/context/theme-provider";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { Fragment, PropsWithChildren } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default async function ThemeLayout({
  children,
  overrideTheme,
  disableToggle,
}: PropsWithChildren<{
  overrideTheme?: "dark" | "light";
  disableToggle?: boolean;
}>) {
  const cookieStore = cookies();
  const theme =
    overrideTheme ??
    (cookieStore.get("theme")?.value === "dark" ? "dark" : "light");

  return (
    <body className={cn(inter.className, theme)} suppressHydrationWarning>
      <ThemeProvider defaultTheme={theme} disableToggle={disableToggle}>
        <Fragment>{children}</Fragment>
        <Toaster />
      </ThemeProvider>
      <Analytics />
      <Script async defer src="https://buttons.github.io/buttons.js" />
    </body>
  );
}

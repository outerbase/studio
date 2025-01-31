import PageTracker from "@/components/page-tracker";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { Fragment } from "react";
import ThemeLayout from "../(theme)/theme_layout";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout overrideTheme="dark">
      <Fragment>{children}</Fragment>
      <Toaster />
      <Analytics />
      <PageTracker />
      <Script async defer src="https://buttons.github.io/buttons.js" />
    </ThemeLayout>
  );
}

import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Fragment } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import PageTracker from "@/components/page-tracker";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className={cn(inter.className, "dark")}>
      <Fragment>{children}</Fragment>
      <Toaster />
      <Analytics />
      <PageTracker />
      <Script async defer src="https://buttons.github.io/buttons.js" />
    </body>
  );
}

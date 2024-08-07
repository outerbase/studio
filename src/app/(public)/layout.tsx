import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Fragment } from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className={inter.className} suppressHydrationWarning>
      <Fragment>{children}</Fragment>
      <Toaster />
      <Analytics />
      <Script async defer src="https://buttons.github.io/buttons.js" />
    </body>
  );
}

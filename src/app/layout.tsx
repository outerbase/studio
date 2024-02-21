import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibSQL Studio",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="prefetch" href="/client" />
      </head>
      <body className={inter.className}>
        {process.env.ENABLE_ANALYTIC && (
          <Script async defer src="https://scripts.withcabin.com/hello.js" />
        )}
        {children}
      </body>
    </html>
  );
}

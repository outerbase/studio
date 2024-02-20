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
        {process.env.NEXT_PUBLIC_GA && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`}
            />
            <Script id="ga">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
          });

          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA}');
        `}</Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}

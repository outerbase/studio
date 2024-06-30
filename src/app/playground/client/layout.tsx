import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="/sqljs/sql-wasm.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}

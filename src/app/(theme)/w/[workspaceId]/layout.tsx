import { OuterbaseSessionProvider } from "@/outerbase-cloud/session-provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OuterbaseSessionProvider>{children}</OuterbaseSessionProvider>;
}

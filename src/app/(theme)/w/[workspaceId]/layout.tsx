import { OuterbaseSessionProvider } from "@/outerbase-cloud/session-provider";
import ThemeLayout from "../../theme_layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout>
      <OuterbaseSessionProvider>{children}</OuterbaseSessionProvider>
    </ThemeLayout>
  );
}

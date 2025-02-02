import { OuterbaseSessionProvider } from "@/app/(outerbase)/session-provider";
import ThemeLayout from "../../../(theme)/theme_layout";
import { WorkspaceProvider } from "../../workspace-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout>
      <OuterbaseSessionProvider>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </OuterbaseSessionProvider>
    </ThemeLayout>
  );
}

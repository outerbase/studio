import { OuterbaseSessionProvider } from "@/app/(outerbase)/session-provider";
import ClientOnly from "@/components/client-only";
import { WorkspaceProvider } from "../(outerbase)/workspace-provider";
import ThemeLayout from "../(theme)/theme_layout";

export default function OuterbaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout overrideTheme="dark">
      <ClientOnly>
        <OuterbaseSessionProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </OuterbaseSessionProvider>
      </ClientOnly>
    </ThemeLayout>
  );
}

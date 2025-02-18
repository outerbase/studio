import { OuterbaseSessionProvider } from "@/app/(outerbase)/session-provider";
import ClientOnly from "@/components/client-only";
import ThemeLayout from "../(theme)/theme_layout";
import { WorkspaceProvider } from "./workspace-provider";

export default function OuterbaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout>
      <ClientOnly>
        <OuterbaseSessionProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </OuterbaseSessionProvider>
      </ClientOnly>
    </ThemeLayout>
  );
}

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
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </ClientOnly>
    </ThemeLayout>
  );
}

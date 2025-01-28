import ClientOnly from "@/components/client-only";
import ThemeLayout from "../../theme_layout";
import WorkspaceListPageClient from "./page-client";

interface WorkspaceListPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceListPage(props: WorkspaceListPageProps) {
  const params = await props.params;

  return (
    <ThemeLayout>
      <ClientOnly>
        <WorkspaceListPageClient workspaceId={params.workspaceId} />
      </ClientOnly>
    </ThemeLayout>
  );
}

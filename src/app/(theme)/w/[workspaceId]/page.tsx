import ClientOnly from "@/components/client-only";
import WorkspaceListPageClient from "./page-client";

interface WorkspaceListPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceListPage(props: WorkspaceListPageProps) {
  const params = await props.params;

  return (
    <ClientOnly>
      <WorkspaceListPageClient workspaceId={params.workspaceId} />
    </ClientOnly>
  );
}

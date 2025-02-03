import ClientOnly from "@/components/client-only";
import OuterbaseSourcePageClient from "./page-client";

interface OuterbaseSourcePageProps {
  params: Promise<{
    workspaceId: string;
    baseId: string;
  }>;
}

export default async function OuterbaseSourcePage(
  props: OuterbaseSourcePageProps
) {
  const params = await props.params;

  return (
    <ClientOnly>
      <OuterbaseSourcePageClient
        baseId={params.baseId}
        workspaceId={params.workspaceId}
      />
    </ClientOnly>
  );
}

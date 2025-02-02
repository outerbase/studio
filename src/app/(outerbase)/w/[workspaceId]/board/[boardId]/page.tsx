import ClientOnly from "@/components/client-only";
import BoardPageClient from "./page-client";

interface BoardPageProps {
  params: Promise<{ workspaceId: string; boardId: string }>;
}

export default async function BoardPage(props: BoardPageProps) {
  const params = await props.params;

  return (
    <ClientOnly>
      <BoardPageClient
        workspaceId={params.workspaceId}
        boardId={params.boardId}
      />
    </ClientOnly>
  );
}

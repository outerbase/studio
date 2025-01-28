import ClientOnly from "@/components/client-only";
import ThemeLayout from "../../../../theme_layout";
import BoardPageClient from "./page-client";

interface BoardPageProps {
  params: Promise<{ workspaceId: string; boardId: string }>;
}

export default async function BoardPage(props: BoardPageProps) {
  const params = await props.params;

  return (
    <ThemeLayout>
      <ClientOnly>
        <BoardPageClient
          workspaceId={params.workspaceId}
          boardId={params.boardId}
        />
      </ClientOnly>
    </ThemeLayout>
  );
}

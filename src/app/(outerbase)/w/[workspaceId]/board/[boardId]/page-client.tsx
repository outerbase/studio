"use client";

export default function BoardPageClient({
  workspaceId,
  boardId,
}: {
  workspaceId: string;
  boardId: string;
}) {
  return (
    <div>
      {workspaceId} {boardId}
    </div>
  );
}

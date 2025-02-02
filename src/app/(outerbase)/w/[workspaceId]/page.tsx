"use client";
import ClientOnly from "@/components/client-only";
import WorkspaceListPageClient from "./page-client";

export default function WorkspaceListPage() {
  return (
    <ClientOnly>
      <WorkspaceListPageClient />
    </ClientOnly>
  );
}

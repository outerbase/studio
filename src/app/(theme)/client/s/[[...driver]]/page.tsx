import ClientOnly from "@/components/client-only";
import ClientPageBody from "./page-client";

export const runtime = "edge";

export default function SessionPage() {
  return (
    <ClientOnly>
      <ClientPageBody />
    </ClientOnly>
  );
}
